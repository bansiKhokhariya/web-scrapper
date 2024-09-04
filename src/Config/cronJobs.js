const cron = require('node-cron');
const { finnScrapeData , testCronAPI } = require('../Controllers/FinnDataController');
const { olxScrapeData } = require('../Controllers/OlxController');
const { updateMissingPhoneNumbers } = require('../Controllers/fetchNumberController'); // Adjust the path as needed

// Schedule the updateMissingPhoneNumbers to run every minute
cron.schedule('30 11 * * *', async () => {
    console.log('Running test cron every minute');
    await testCronAPI();
});

