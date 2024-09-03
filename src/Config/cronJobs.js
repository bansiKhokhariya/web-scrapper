const cron = require('node-cron');
const { finnScrapeData } = require('../Controllers/FinnDataController');
const { olxScrapeData } = require('../Controllers/OlxController');
const { updateMissingPhoneNumbers } = require('../Controllers/fetchNumberController'); // Adjust the path as needed

// Schedule finnScrapeData to run every 5 minutes    
cron.schedule('30 17 * * *', async () => {
    console.log('Running FinnDataScrapper every day 5:00 PM ');
    await finnScrapeData();
});

// Schedule olxScrapeData to run every 10 minutes
// cron.schedule('* 18 * * *', async () => {
//     console.log('Running FinnDataScrapper every day 5:30 PM');
//     await olxScrapeData();
// });


// Schedule the cron job to run every 10 minutes
// cron.schedule('*/10 * * * *', async () => {
//     console.log('Running updateMissingPhoneNumbers every 10 minutes');
//     await updateMissingPhoneNumbers();
// });
