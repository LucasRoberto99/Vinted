const express = require("express");

const fileUpload = require("express-fileupload");

const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};

const router = express.Router();

const Profile = require("../models/Profile");

const isAuthenticated = require("../middlewares/isAuthenticated");
const Offer = require("../models/Offer");
// const { default: mongoose } = require("mongoose");
// const { findByIdAndDelete } = require("../models/Offer");

router.post(
  "/offer/publish",
  fileUpload(),
  isAuthenticated,

  async (req, res) => {
    try {
      //! je déstructure
      const { title, description, price, condition, city, brand, size, color } =
        req.body;
      //   const pictureToUpload = req.files.picture;
      //   console.log(pictureToUpload);
      //* mtn je crée le buffer en base 64

      if (
        !title ||
        !description ||
        !price ||
        !condition ||
        !brand ||
        !size ||
        !color
      ) {
        return res.status(400).json({ message: "Information missing" });
      }

      const newOffer = new Offer({
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          {
            MARQUE: brand,
          },
          {
            TAILLE: size,
          },
          {
            ÉTAT: condition,
          },
          {
            COULEUR: color,
          },
          {
            EMPLACEMENT: city,
          },
        ],
        owner: req.profile._id,

        // product_image: picture,
      });
      await newOffer.save();
      const picture = await cloudinary.uploader.upload(
        convertToBase64(req.files.picture),
        {
          folder: `/vinted/offers/${newOffer._id}`,
        }
      );
      newOffer.product_image = picture;
      await newOffer.save();
      const response = {
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          {
            MARQUE: brand,
          },
          {
            TAILLE: size,
          },
          {
            ÉTAT: condition,
          },
          {
            COULEUR: color,
          },
          {
            EMPLACEMENT: city,
          },
        ],
        owner: {
          account: {
            username: req.profile.account.username,
            avatar: "",
          },
          _id: req.profile._id,
        },

        product_image: picture,
      };

      return res.json(response);
    } catch (error) {
      //   console.log(error);
      res.status(400).json({ message: error.message });
    }
  }
);

// router.put("/offer/update", async (req, res) => {
//   try {
//     const offerToUpdate = Offer.findByIdAndUpdate(req.body._id);
//     return res.json(offerToUpdate);
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

router.delete("/offer/delete", async (req, res) => {
  try {
    const offer = await Offer.findById(req.body._id);
    const publicId = offer.product_image.public_id;

    const destroyer = await cloudinary.uploader.destroy(publicId);
    // console.log(req.body);
    await Offer.findByIdAndDelete(req.body._id);
    return res.json({ message: "offer deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/offers", async (req, res) => {
  try {
    let { title, priceMin, priceMax, sort, page } = req.query;
    // console.log(priceMin);
    if (!title) {
      title = "";
    }
    if (!priceMin) {
      priceMin = 0;
    } else {
      priceMin = parseInt(priceMin);
    }
    if (!priceMax) {
      priceMax = Number.POSITIVE_INFINITY;
    } else {
      priceMax = parseInt(priceMax);
    }

    if (!sort || sort !== "price-desc" || sort !== "price-asc") {
      sort = "";
    }
    if (!page) {
      page = 1;
    } else {
      parseInt(page);
    }
    const regExp = new RegExp(title, "i");
    const lengthOffer = await Offer.find().length;
    // console.log(lengthOffer); //! 10 donc on va faire 3 par 3
    //! la limite est de 3 articles par pages donc:
    //! il faut faire : 0 3 6 9        -------> (page-1)*3 OUI
    const pageSkip = (page - 1) * 3;
    const results = await Offer.find({
      product_name: regExp,
      product_price: {
        $gte: priceMin,
        $lte: priceMax,
      },
    })
      .populate({
        path: "owner",
        select: "account",
      })
      .sort({ product_price: sort })
      .skip(pageSkip)
      .limit(3)
      .select("product_name product_price");
    res.json({
      count: lengthOffer,
      offers: results,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    console.log(req.params);
    const offerFound = await Offer.findById(req.params.id).populate(
      "owner",
      "account _id" //! no need de mettre id car c'est implicite
    );
    res.json(offerFound);
    console.log(offerFound);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
