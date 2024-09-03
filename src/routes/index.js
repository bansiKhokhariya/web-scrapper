const express = require("express");
const routes = express.Router();
const fs = require("fs");
const path = require("path");

const routesDirectory = path.join(__dirname, "v1");

fs.readdirSync(routesDirectory).forEach((file) => {
  if (file.endsWith(".js")) {
    const routeModule = require(path.join(routesDirectory, file));
    routes.use("/api/v1/scrape", routeModule);
  }
});

// Import the cron jobs file to ensure it's executed
// require('../Config/cronJobs'); 

routes.use("/", (req, res) => {
  res.status(200).send("Server is running on develop");
});

module.exports = routes;

