const express = require("express");
const router = express.Router();
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

const Profile = require("../models/Profile");

router.post("/user/signup", async (req, res) => {
  try {
    const { username, email, password, newsletter } = req.body;
    if (!username || !email || !password || typeof newsletter !== "boolean") {
      //   console.log(username);
      return res.status(400).json({ message: "Please enter an username" });
    }
    const profilToFind = await Profile.exists({ email: email });
    if (profilToFind) {
      return res.status(400).json({ message: "email already used" });
    }
    const salt = uid2(16);
    const hash = SHA256(salt + password).toString(encBase64);
    const token = uid2(64);
    const newProfile = new Profile({
      email: email,
      account: {
        username: username,
        avatar: Object,
      },
      newsletter: newsletter,
      token: token,
      hash: hash,
      salt: salt,
    });
    // console.log(newProfile);
    await newProfile.save();
    const profile1 = await Profile.findOne({ email: email });
    const resProfile = {
      _id: profile1._id,
      token: profile1.token,
      account: profile1.account,
    };
    // console.log(resProfile);
    res.json(resProfile);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//? relax

//! take it

//* easy

router.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const profilToFind = await Profile.exists({ email: email });
    // console.log(profilToFind);
    if (profilToFind === null) {
      return res.status(400).json({ message: "Incorrect email or password" });
    }
    const profile = await Profile.findOne({ email: email });
    // console.log(profile);
    const passwordToTrySaltHashed = SHA256(profile.salt + password).toString(
      encBase64
    );
    // console.log(passwordToTrySaltHashed);
    if (passwordToTrySaltHashed === profile.hash) {
      const resProfile = {
        _id: profile._id,
        token: profile.token,
        account: profile.account,
      };
      res.json(resProfile);
    } else {
      res.status(400).json({ message: "Incorrect email or password" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
module.exports = router;
