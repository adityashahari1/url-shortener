const URL = require("../models/url");
const shortid = require("shortid");
const { URL: URLConstructor } = require("url");
const { getBaseUrl } = require("../utils/urlHelper");

function isValidUrl(string) {
  if (!string || typeof string !== "string") {
    return false;
  }

  // Trim whitespace
  const trimmedUrl = string.trim();

  if (!trimmedUrl) {
    return false;
  }

  // Basic check for invalid characters
  if (trimmedUrl.includes(" ")) {
    return false;
  }

  try {
    // If URL doesn't start with http:// or https://, try adding https://
    let urlToValidate = trimmedUrl;
    if (!trimmedUrl.match(/^https?:\/\//i)) {
      urlToValidate = "https://" + trimmedUrl;
    }

    const url = new URLConstructor(urlToValidate);

    // Check if it has a valid hostname
    if (!url.hostname || url.hostname.length === 0) {
      return false;
    }

    // Check for valid protocol
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (error) {
    return false;
  }
}

async function handleCreateShortId(req, res) {
  let redirectUrl = req.body.url;

  // Trim whitespace
  if (redirectUrl) {
    redirectUrl = redirectUrl.trim();
  }

  const baseUrl = getBaseUrl(req);

  if (!redirectUrl) {
    const allUrls = await URL.find({ createdBy: req.user._id });
    return res.render("home", {
      urls: allUrls,
      user: req.user,
      baseUrl,
      error: "URL is required",
    });
  }

  // Validate URL format
  if (!isValidUrl(redirectUrl)) {
    const allUrls = await URL.find({ createdBy: req.user._id });
    return res.render("home", {
      urls: allUrls,
      user: req.user,
      baseUrl,
      error:
        "Please enter a valid URL (e.g., https://example.com or example.com)",
    });
  }

  // Normalize URL - add https:// if protocol is missing
  let normalizedUrl = redirectUrl;
  if (!redirectUrl.match(/^https?:\/\//i)) {
    normalizedUrl = "https://" + redirectUrl;
  }

  try {
    const shortUrl = shortid.generate();

    await URL.create({
      shortId: shortUrl,
      redirectUrl: normalizedUrl,
      userVisits: [],
      createdBy: req.user._id,
    });

    const allUrls = await URL.find({ createdBy: req.user._id });
    return res.render("home", {
      urls: allUrls,
      user: req.user,
      baseUrl,
      id: shortUrl,
    });
  } catch (error) {
    const allUrls = await URL.find({ createdBy: req.user._id });
    return res.render("home", {
      urls: allUrls,
      user: req.user,
      baseUrl,
      error: "Something went wrong. Please try again.",
    });
  }
}

async function handleRedirect(req, res) {
  const shortId = req.params.id;

  const entry = await URL.findOneAndUpdate(
    {
      shortId,
    },
    {
      $push: {
        userVisits: {
          timestamp: Date.now(),
        },
      },
    }
  );
  if (!entry) return res.status(404).send("Short URL not found!");
  res.redirect(entry.redirectUrl);
}

async function handleVisits(req, res) {
  const shortId = req.params.id;

  const result = await URL.findOne({
    shortId: shortId,
  });

  if (!result) {
    return res.status(404).json({ msg: "URL not found" });
  }

  return res.status(200).json({
    totalClicks: result.userVisits.length,
    analytics: result.userVisits,
  });
}

async function handleDeleteUrl(req, res) {
  const shortId = req.params.id;

  try {
    const url = await URL.findOne({ shortId });

    const baseUrl = getBaseUrl(req);

    if (!url) {
      const allUrls = await URL.find({ createdBy: req.user._id });
      return res.render("home", {
        urls: allUrls,
        user: req.user,
        baseUrl,
        error: "URL not found",
      });
    }

    // Check if the URL belongs to the current user
    if (url.createdBy.toString() !== req.user._id.toString()) {
      const allUrls = await URL.find({ createdBy: req.user._id });
      return res.render("home", {
        urls: allUrls,
        user: req.user,
        baseUrl,
        error: "You don't have permission to delete this URL",
      });
    }

    await URL.findOneAndDelete({ shortId });
    const allUrls = await URL.find({ createdBy: req.user._id });
    return res.render("home", {
      urls: allUrls,
      user: req.user,
      baseUrl,
      success: "URL deleted successfully",
    });
  } catch (error) {
    const allUrls = await URL.find({ createdBy: req.user._id });
    return res.render("home", {
      urls: allUrls,
      user: req.user,
      baseUrl: getBaseUrl(req),
      error: "Something went wrong. Please try again.",
    });
  }
}

async function handleRefreshUrls(req, res) {
  try {
    const allUrls = await URL.find({ createdBy: req.user._id });

    // Return JSON with URLs and their click counts
    const urlsData = allUrls.map((url) => ({
      _id: url._id.toString(),
      shortId: url.shortId,
      redirectUrl: url.redirectUrl,
      clicks: url.userVisits.length,
      createdAt: url.createdAt,
    }));

    return res.status(200).json({
      success: true,
      urls: urlsData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Something went wrong. Please try again.",
    });
  }
}

module.exports = {
  handleCreateShortId,
  handleRedirect,
  handleVisits,
  handleDeleteUrl,
  handleRefreshUrls,
};
