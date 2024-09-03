const express = require("express");
const routes = express.Router();
const FinnDataController = require("../../Controllers/FinnDataController");
const OlxController = require("../../Controllers/OlxController");
const testProxie = require("../../Controllers/testProxie");

// firebase config get route
routes.get("/finnData", FinnDataController.finnScrapeData);
routes.get("/olx", OlxController.olxScrapeData);
routes.get("/testProxie", testProxie.testProxie);
// routes.get("/testCronAPI", FinnDataController.testCronAPI);

module.exports = routes;
