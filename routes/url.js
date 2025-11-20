const express = require("express");
const {
  handleCreateShortId,
  handleRedirect,
  handleVisits,
  handleDeleteUrl,
  handleRefreshUrls,
} = require("../controllers/url");
const { restrictToLoginUserOnly } = require("../middlewares/auth");

const router = express.Router();

router.route("/").post(restrictToLoginUserOnly, handleCreateShortId);
router.route("/refresh").get(restrictToLoginUserOnly, handleRefreshUrls);
router.route("/analytics/:id").get(restrictToLoginUserOnly, handleVisits);
router.route("/delete/:id").get(restrictToLoginUserOnly, handleDeleteUrl);
router.route("/:id").get(handleRedirect); // No auth required for redirect - must be last

module.exports = router;
