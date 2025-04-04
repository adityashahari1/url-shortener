const express = require("express");
const shortid = require("shortid");
const { connectMongoDB } = require("./connection");
const urlRouter = require("./routes/url");

const app = express();
const PORT = 8000;

// Mongoose connection

connectMongoDB("mongodb://127.0.0.1:27017/url-shortener").then(() =>
  console.log("MongoDB connected")
);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/url", urlRouter);

app.listen(PORT, () => console.log(`Server started at PORT: ${PORT}`));
