const cron = require('node-cron');
const { finnScrapeData } = require('../Controllers/FinnDataController');
const { olxScrapeData } = require('../Controllers/OlxControllerOlxController');

cron.schedule('* * * * *', async () => {
    console.log('Cron job running every minute');

    try {
        await finnScrapeData();
    } catch (error) {
        console.error('Error running FinnDataScrapper:', error);
    }

    try {
        await olxScrapeData();
    } catch (error) {
        console.error('Error running olxScrapeData:', error);
    }
});

