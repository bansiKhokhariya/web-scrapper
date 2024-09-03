const cron = require('node-cron');
const { finnScrapeData } = require('../Controllers/FinnDataController');
const { olxScrapeData } = require('../Controllers/OlxController');

// Schedule finnScrapeData to run every 5 minutes    
cron.schedule('0 5 * * *', async () => {
    console.log('Running FinnDataScrapper every day 5:00 PM ');
    await finnScrapeData();
});

// Schedule olxScrapeData to run every 10 minutes
cron.schedule('30 5 * * *', async () => {
    console.log('Running FinnDataScrapper every day 5:30 PM');
    await olxScrapeData();
});

