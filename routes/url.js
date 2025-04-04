const express = require("express");
const {
  handleCreateShortId,
  handleRedirect,
  handleVisits,
} = require("../controllers/url");

const router = express.Router();

router.route("/").post(handleCreateShortId);
router.route("/:id").get(handleRedirect);
router.route("/analytics/:id").get(handleVisits);

module.exports = router;
