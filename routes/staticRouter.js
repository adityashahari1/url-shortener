const express = require("express");
const URL = require("../models/url");
const { getBaseUrl } = require("../utils/urlHelper");

const router = express.Router();

router.get("/", async (req, res) => {
  if (!req.user) return res.redirect("/login");

  const allUrls = await URL.find({ createdBy: req.user._id });
  return res.render("home", {
    urls: allUrls,
    user: req.user,
    baseUrl: getBaseUrl(req),
  });
});

router.get("/signup", (req, res) => {
  if (req.user) return res.redirect("/");
  return res.render("signup");
});

router.get("/login", (req, res) => {
  if (req.user) return res.redirect("/");
  return res.render("login");
});

module.exports = router;
