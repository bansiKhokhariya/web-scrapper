const clientPromise = require("../Config/mongodb");
const puppeteer = require('puppeteer');
const axios = require("axios");

async function fetchListingDetails(listing) {
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: { width: 1280, height: 800 },
    });

    const page = await browser.newPage();

    try {
        await page.goto(listing.link, { waitUntil: 'networkidle2' });

        // Attempt to find the "Show Phone" button
        const showPhoneButton = await page.$('button[data-testid="show-phone"]');

        if (showPhoneButton) {
            // Click the "Show Phone" button
            await showPhoneButton.click();

            // Wait for the phone number to be visible
            await page.waitForSelector('a[data-testid="contact-phone"]', { timeout: 60000 });
            const phoneNumber = await page.$eval('a[data-testid="contact-phone"]', el => el.textContent?.trim() || '');

            // Update the listing object with the phone number
            listing.phoneNumber = phoneNumber;

            // Connect to MongoDB and update the document with the phone number
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
        } else {
            // If the "Show Phone" button is not found, set phoneNumber to null
            listing.phoneNumber = null;

            // Connect to MongoDB and update the document with null phone number
            const client = await clientPromise;
            const db = client.db('scrapper');
            const collection = db.collection('olx_new_Data');

            await collection.updateOne(
                { link: listing.link },
                { $set: { phoneNumber: null } }
            );

            console.log('Phone number not found for:', listing.title, '=================>' + listing.phoneNumber);
        }
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
