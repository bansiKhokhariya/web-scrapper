const clientPromise = require("../Config/mongodb");
const puppeteer = require('puppeteer');
const axios = require("axios");

async function fetchListingDetails(listing) {

    // const socksProxy = 'socks5://a6d8hu_3:a6d8hu_3@p-11787.sp4.ovh:11004';
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: { width: 1280, height: 800 },
    });

    const page = await browser.newPage();

    await page.goto(listing.link, { waitUntil: 'networkidle2' });

    try {
        // Click the "Show Phone" button
        await page.waitForSelector('button[data-testid="show-phone"]', { timeout: 60000 });
        await page.click('button[data-testid="show-phone"]');

        // Wait for the phone number to be visible
        await page.waitForSelector('a[data-testid="contact-phone"]', { timeout: 60000 });
        const phoneNumber = await page.$eval('a[data-testid="contact-phone"]', el => el.textContent?.trim() || '');

        // Update the listing object with the phone number
        listing.phoneNumber = phoneNumber;

        // Connect to MongoDB and update the document
        const client = await clientPromise;
        const db = client.db('scrapper');
        const collection = db.collection('olx_new_Data');

        await collection.updateOne(
            { link: listing.link },
            { $set: { phoneNumber } }
        );

        const message = `Phone number updated: ${listing.title} ====================> ${phoneNumber} `;
        await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: message,
        });

        console.log('Phone number updated:', listing.title, '=================>' + phoneNumber);
    } catch (error) {
        const message = `Failed to fetch details for ${listing.title}`;
        await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            chat_id: process.env.TELEGRAM_CHAT_ID,
            text: message,
        });
        console.error(`Failed to fetch details for ${listing.link}:`, error.message);
    } finally {
        await browser.close();
    }
}

async function updateMissingPhoneNumbers() {
    try {
        const client = await clientPromise;
        const db = client.db('scrapper');
        const collection = db.collection('olx_new_Data');

        // Fetch listings with no phone number
        const listings = await collection.find({ phoneNumber: { $exists: false } }).limit(10).toArray();

        if (listings.length === 0) {
            console.log('No listings without phone numbers found.');
            return;
        }

        console.log(`Found ${listings.length} listings without phone numbers. Fetching details...`);

        // Fetch phone numbers for each listing
        for (const listing of listings) {
            await fetchListingDetails(listing);
        }

        console.log('Batch processing completed.');
    } catch (error) {
        console.error('Error updating phone numbers:', error.message);
    }
}

module.exports = { updateMissingPhoneNumbers };
