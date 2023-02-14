const express = require("express");
const cors = require("cors");

const stripe = require("stripe")(
  "sk_test_51MbRAjDzVo2gj2qxncMCv2XggrbDyTXY35x3E2r9tftIw2PAC4t2f3dMoOw9TA3dCCXUWTipxrFZDgyKRjYC69vw00wRRMeTEm"
);
const isAuthenticated = require("../middlewares/isAuthenticated");

const Offer = require("../models/Offer");

const router = express.Router();
router.use(express.json());
router.use(cors());

router.post("/pay", isAuthenticated, async (req, res) => {
  try {
    // console.log("hey");

    const { stripeToken, price, id, description } = req.body;

    // console.log(id);

    const response = await stripe.charges.create({
      amount: (price + 8.4) * 1000,
      currency: "eur",
      description: description,
      source: stripeToken,
    });
    // console.log(response.status);

    if (response.status === "succeeded") {
      // console.log(id);
      const offerSold = await Offer.findByIdAndUpdate(id, { sold: true });
      const offeryo = await Offer.findById(id);
      console.log(offeryo);
      // offerSold.sold = true;

      // await offerSold.save();
    }

    res.json(response);
  } catch (error) {
    console.log(error.message);
  }
});

module.exports = router;
