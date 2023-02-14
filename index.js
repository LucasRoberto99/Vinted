const express = require("express");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
require("dotenv").config();
const app = express();
app.use(express.json());

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
app.get("/", (req, res) => {
  res.json({ message: "Welcome on my server" });
});
app.all("*", (req, res) => {
  res.status(404).json({ message: "This route doesn't exist" });
});

app.listen(process.env.PORT, () => {
  console.log("Server STARTED");
});
