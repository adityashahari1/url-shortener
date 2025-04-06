const URL = require("../models/url");
const shortid = require("shortid");

async function handleCreateShortId(req, res) {
  const redirectUrl = req.body.url;

  if (!redirectUrl) return res.status(400).json({ Error: "Url is required" });

  const shortUrl = shortid.generate();

  await URL.create({
    shortId: shortUrl,
    redirectUrl: redirectUrl,
  });

  return res.render("home", {
    id: shortUrl,
  });
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

module.exports = {
  handleCreateShortId,
  handleRedirect,
  handleVisits,
};
