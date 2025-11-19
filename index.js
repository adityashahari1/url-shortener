const express = require("express");
const shortid = require("shortid");
const path = require("path");
const cookieParser = require("cookie-parser");
const { connectMongoDB } = require("./connection");
const urlRoute = require("./routes/url");
const staticRoute = require("./routes/staticRouter");
const userRoute = require("./routes/user");
const { restrictToLoginUserOnly, checkAuth } = require("./middlewares/auth");

const app = express();
const PORT = process.env.PORT || 8000;

// Mongoose connection
const MONGODB_URL =
  process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/url-shortener";

connectMongoDB(MONGODB_URL)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

// Health check endpoint
app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/url", urlRoute);
app.use("/", checkAuth, staticRoute);
app.use("/user", userRoute);

// 404 handler
app.use((req, res) => {
  res.status(404).render("404", { user: req.user || null });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("error", {
    error: "Something went wrong!",
    user: req.user || null,
  });
});

app.listen(PORT, () => console.log(`Server started at PORT: ${PORT}`));
