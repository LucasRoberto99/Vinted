const Profile = require("../models/Profile");

const isAuthenticated = async (req, res, next) => {
  if (req.headers.authorization) {
    const profile = await Profile.findOne({
      token: req.headers.authorization.replace("Bearer ", ""),
    });

    if (!profile) {
      return res.status(402).json({ error: "Unauthorized" });
    } else {
      req.profile = profile;
      // On crée une clé "user" dans req. La route dans laquelle le middleware est appelé     pourra avoir accès à req.user
      return next();
    }
  } else {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

module.exports = isAuthenticated;
