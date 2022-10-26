const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Forbidden" });
      }
      console.log(decoded);
      req.user = decoded._doc ? decoded._doc : decoded;
      next();
    });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong. Try again" });
    console.log(err);
  }
};

module.exports = verifyToken;
