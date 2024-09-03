const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require('puppeteer');

const testProxie = async (req, res) => {

    console.log('test proxie');

    // Define your SOCKS5 proxy details (without authentication)
    const socksProxy = 'p-11787.sp4.ovh:11004';

    // // Set up Chrome options to use the SOCKS5 proxy
    // let options = new chrome.Options();
    // options.addArguments(`--proxy-server=socks5://${socksProxy}`);
    // options.addArguments('--ignore-certificate-errors');
    // options.addArguments('--no-sandbox');
    // options.addArguments('--disable-gpu');
    // options.addArguments('--disable-dev-shm-usage'); // Important for low memory systems
    // options.addArguments('--disable-software-rasterizer');
    // // options.addArguments('--headless'); // Optional: Run in headless mode

    // try {
    //     // Initialize the WebDriver
    //     let driver = await new Builder()
    //         .forBrowser('chrome')
    //         .setChromeOptions(options)
    //         .build();

    //     // Navigate to the website
    //     await driver.get('https://www.olx.ua/d/uk/obyavlenie/zernozbiralniy-kombayn-sampo-rosenlew-580-IDTeVyb.html');

    //     // Print the page title to verify successful navigation
    //     const title = await driver.getTitle();
    //     console.log('Page title:', title);

    //     // Quit the driver
    //     await driver.quit();
    // } catch (error) {
    //     console.error('Error:', error.message);
    // }
}

module.exports = { testProxie }