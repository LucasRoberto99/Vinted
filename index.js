const express = require("express");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
require("dotenv").config();
const app = express();
app.use(express.json());
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cors = require("cors");
app.use(cors());
mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGODB_URI);

//import de mes routes
const profileRoute = require("./routes/profile");
const offerRoute = require("./routes/offer");
// je les utilise
app.use(profileRoute);
app.use(offerRoute);

app.all("*", (req, res) => {
  res.status(404).json({ message: "This route doesn't exist" });
});

app.listen(3000, () => {
  console.log("Server STARTED");
});
