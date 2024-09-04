const cron = require('node-cron');
const { finnScrapeData , testCronAPI } = require('../Controllers/FinnDataController');
const { olxScrapeData } = require('../Controllers/OlxController');
const { updateMissingPhoneNumbers } = require('../Controllers/fetchNumberController'); // Adjust the path as needed

// cron.schedule('0 8 * * *', async () => {
//     console.log('Running FinnDataScrapper every day at 5:00 PM');
//     await finnScrapeData();
// });

// // Schedule olxScrapeData to run every day at 5:30 PM
// cron.schedule('30 8 * * *', async () => {
//     console.log('Running OlxScrapper every day at 5:30 PM');
//     await olxScrapeData();
// });

// // Schedule the updateMissingPhoneNumbers to run every hour
// cron.schedule('*/10 * * * *', async () => {
//     console.log('Running updateMissingPhoneNumbers every hour');
//     await updateMissingPhoneNumbers();
// });

// Schedule the updateMissingPhoneNumbers to run every minute
cron.schedule('* * * * *', async () => {
    console.log('Running test cron every minute');
    await testCronAPI();
});

