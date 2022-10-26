const router = require("express").Router();
const {
  register,
  checkUsername,
  login,
  refresh,
  logout,
  update,
  getUser
} = require("../controllers/authController");
const verifyToken = require("../middleware/verifyToken");

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.post("/checkusername", checkUsername);
router.get("/refresh", refresh);
router.put("/", verifyToken, update);
router.get("/getuser", verifyToken, getUser);

module.exports = router;
