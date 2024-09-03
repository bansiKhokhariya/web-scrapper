const puppeteer = require('puppeteer');

const testProxie = async (req, res) => {

    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: { width: 1280, height: 800 },
    });

    const page = await browser.newPage();

    await page.goto('https://www.olx.ua/d/uk/obyavlenie/claas-lexion-670-c750-IDUOatu.html', { waitUntil: 'networkidle2' });

    try {
        // Click the "Show Phone" button
        await page.waitForSelector('button[data-testid="show-phone"]', { timeout: 60000 });
        await page.click('button[data-testid="show-phone"]');

        // Wait for the phone number to be visible
        await page.waitForSelector('a[data-testid="contact-phone"]', { timeout: 60000 });
        const phoneNumber = await page.$eval('a[data-testid="contact-phone"]', el => el.textContent?.trim() || '');

        res.json({ success: true, phoneNumber: phoneNumber });

    } catch (error) {
        console.error(`Failed to fetch details for ${listing.link}:`, error.message);
    } finally {
        await browser.close();
    }

}

module.exports = { testProxie }