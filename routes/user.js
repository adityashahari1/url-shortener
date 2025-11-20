const express = require("express");
const { handleUserSignup, handleUserLogin, handleUserLogout } = require("../controllers/user");
const { restrictToLoginUserOnly } = require("../middlewares/auth");

const router = express.Router();

router.post("/", handleUserSignup);
router.post("/login", handleUserLogin);
router.get("/logout", restrictToLoginUserOnly, handleUserLogout);

module.exports = router;
