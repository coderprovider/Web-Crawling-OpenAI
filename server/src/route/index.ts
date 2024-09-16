const express = require("express");
const router = express.Router();

const manualCrawlController = require("../controller/manualCrawlController")
const sitemapCrawlController = require("../controller/sitemapCrawl")
const getTitleController = require("../controller/getGenerateTitleByAI")
const getSeoSuggestion = require("../controller/getSeoSuggestion")

router.post("/crawl/target", manualCrawlController.manualWebCrawl)
router.post("/crawl/sitemap", sitemapCrawlController.sitemapCrawl)
router.post("/ai/title", getTitleController.getGenerateTitleByAI)
router.post("/ai/seo", getSeoSuggestion.getSeoSuggestion)

module.exports = router;
