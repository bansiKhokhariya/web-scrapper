const axios = require("axios");
const cheerio = require("cheerio");
const clientPromise = require("../Config/mongodb");
const puppeteer = require('puppeteer');

async function fetchListingDetails(listing) {

    const socksProxy = 'socks5://a6d8hu_3:a6d8hu_3@p-11787.sp4.ovh:11004';
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            `--proxy-server=${socksProxy}`,
            '--ignore-certificate-errors',
            '--allow-running-insecure-content',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-setuid-sandbox',
            '--no-sandbox',
            '--enable-features=NetworkService',
            '--v=1',
        ],
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

        console.log('Phone number updated:', listing.title, '=================>' + phoneNumber);
    } catch (error) {
        console.error(`Failed to fetch details for ${listing.link}:`, error.message);
    } finally {
        await browser.close();
    }
}

const olxScrapeData = async (req, res) => {
    try {
        const url = 'https://www.olx.ua/uk/transport/selhoztehnika/kombain/';

        // Fetch the page content
        const { data } = await axios.get(url);

        // Load the HTML into cheerio
        const $ = cheerio.load(data);

        // Initialize an array to hold the scraped data
        const listings = [];

        // Select and iterate through each listing element
        $('.css-1sw7q4x').each((index, element) => {
            const title = $(element).find('.css-u2ayx9 .css-1wxaaza').text().trim();
            const price = $(element).find('.css-13afqrm').text().trim();
            const link = $(element).find('a.css-z3gu2d').attr('href');
            const image = $(element).find('img').attr('src');

            // Extract additional values
            const transmission = $(element).find('.css-efx9z5').eq(0).text().trim() || undefined;
            const fuelType = $(element).find('.css-efx9z5').eq(1).text().trim() || undefined;
            const engineCapacity = $(element).find('.css-efx9z5').eq(2).text().trim() || undefined;
            const mileage = $(element).find('.css-efx9z5').eq(3).text().trim() || undefined;

            // Ensure link and image are properly handled
            const fullLink = link ? `https://www.olx.ua${link}` : '';
            const fullImage = image ? (image.startsWith('http') ? image : `https://www.olx.ua${image}`) : '';

            // Push the extracted data into the listings array
            listings.push({
                title,
                price,
                link: fullLink,
                image: fullImage,
                transmission,
                fuelType,
                engineCapacity,
                mileage
            });
        });

        // Connect to MongoDB
        const client = await clientPromise;
        const db = client.db('scrapper');
        const collection = db.collection('olx_new_Data');

        const newPosts = [];

        // Insert each post into the database, fetch phone number, and update MongoDB
        for (const post of listings) {
            const exists = await collection.findOne({ link: post.link });
            if (!exists) {
                // Insert the post into the database
                await collection.insertOne(post);
                newPosts.push(post);

                // Fetch details and update MongoDB with the phone number
                // await fetchListingDetails(post);
            }
        }

        if (newPosts.length > 0) {
            // Send Telegram message with the new posts
            const message = `New Olx posts added:\n${newPosts.map(post => `- ${post.title}`).join('\n')}`;
            await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
                chat_id: process.env.TELEGRAM_CHAT_ID,
                text: message,
            });
        }

        res.json({ success: true, listings: newPosts });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { olxScrapeData };
