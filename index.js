const express = require("express");
const shortid = require("shortid");
const path = require("path");
const { connectMongoDB } = require("./connection");
const urlRouter = require("./routes/url");
const staticRouter = require("./routes/staticRouter");
const URL = require("./models/url");

const app = express();
const PORT = 8000;

// Mongoose connection

connectMongoDB("mongodb://127.0.0.1:27017/url-shortener").then(() =>
  console.log("MongoDB connected")
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/url", urlRouter);
app.use("/", staticRouter);

app.listen(PORT, () => console.log(`Server started at PORT: ${PORT}`));
