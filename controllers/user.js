const User = require("../models/user");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const { setUser, deleteUser } = require("../service/auth");

async function handleUserSignup(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.render("signup", {
      error: "All fields are required",
    });
  }

  try {
    await User.create({
      name,
      email,
      password,
    });
    return res.redirect("/login");
  } catch (error) {
    if (error.code === 11000) {
      return res.render("signup", {
        error: "Email already exists. Please use a different email.",
      });
    }
    return res.render("signup", {
      error: "Something went wrong. Please try again.",
    });
  }
}

async function handleUserLogin(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render("login", {
      error: "Email and password are required",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.render("login", {
        error: "Invalid Email or Password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.render("login", {
        error: "Invalid Email or Password",
      });
    }

    const sessionId = uuidv4();
    setUser(sessionId, user);
    res.cookie("uid", sessionId);
    return res.redirect("/");
  } catch (error) {
    return res.render("login", {
      error: "Something went wrong. Please try again.",
    });
  }
}

async function handleUserLogout(req, res) {
  const userUid = req.cookies.uid;
  if (userUid) {
    deleteUser(userUid);
  }
  res.clearCookie("uid");
  return res.redirect("/login");
}

module.exports = {
  handleUserSignup,
  handleUserLogin,
  handleUserLogout,
};
