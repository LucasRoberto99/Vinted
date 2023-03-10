const mongoose = require("mongoose");

const Offer = mongoose.model("Offer", {
  product_name: {
    type: String,
    minLength: 1,
    maxLength: 50,
  },
  product_description: {
    type: String,
    maxLength: 500,
  },
  product_price: {
    type: Number,
    max: 100000,
  },
  product_details: Array,
  product_picture: Object,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
  },
  sold: Boolean,
});

module.exports = Offer;
