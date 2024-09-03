const axios = require("axios");
const cheerio = require("cheerio");
const clientPromise = require("../Config/mongodb");

const finnScrapeData = async (req, res) => {
  try {
    const url = 'https://www.finn.no/b2b/agriculturecombines/search.html?sort=PUBLISHED_DESC';
    const response = await axios.get(url);
    const htmlData = response.data;

    const $ = cheerio.load(htmlData);

    // Extract JSON data from the <script> tag
    const jsonData = $('script#__NEXT_DATA__').html();
    if (!jsonData) {
      throw new Error('JSON data not found in the HTML');
    }

    // Parse JSON data
    const data = JSON.parse(jsonData);

    // Extract the posts
    const posts = data.props.pageProps.search.docs;

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('scrapper');
    const collection = db.collection('finnData');

    const newPosts = [];

    // Check if each post exists and insert if not
    for (const post of posts) {
      const exists = await collection.findOne({ ad_id: post.ad_id });
      if (!exists) {
        await collection.insertOne(post);
        newPosts.push(post);
      }
    }
    if (newPosts.length > 0) {
      // Send Telegram message with the new posts
      const message = `New FinnData posts added:\n${newPosts.map(post => `- ${post.heading}`).join('\n')}`;
      await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: message,
      });
    }
    return res.status(200).json({ success: true, newPosts });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const testCronAPI = async (req, res) => {
  console.log('Hello bansi cron Run');
};

module.exports = { finnScrapeData , testCronAPI};
