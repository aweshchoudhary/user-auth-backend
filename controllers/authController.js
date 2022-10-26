const User = require("../database/schema/user");
const { pwdHash, pwdCompare } = require("../apps/password");
const find = require("../apps/find");
const jwt = require("jsonwebtoken");

const checkUsername = async (req, res) => {
  const { username } = req.body;
  const usernameExist = await find("username", username);
  if (!usernameExist) {
    res.status(200).json({
      message: "Username Available"
    });
  } else {
    res.status(403).json({
      message: "Username Not Available"
    });
  }
};

const getUser = async (req, res) => {
  const { username } = req.user;
  try {
    const user = await find("username", username);
    res.status(200).json({ user });
  } catch (err) {
    console.log(err);
    res.status(404).json({
      message: "User Not Available"
    });
  }
};

const register = async (req, res) => {
  const { fullname, email, username, password } = req.body;

  try {
    const userExist = await find("email", email);
    if (userExist) {
      return res.status(403).json({
        message: "User already exists with this email!"
      });
    }

    const hashedPwd = await pwdHash(password);
    const newUser = await User({
      fullname,
      email,
      username,
      password: hashedPwd
    });
    await newUser.save();

    res.status(200).json({
      message: "User Registered Successfully"
    });
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong try again!"
    });
    console.log(err);
  }
};

const login = async (req, res) => {
  const { user, password } = req.body;
  const field = user.includes("@") ? "email" : "username";
  const userExist = await find(field, user);

  if (userExist) {
    const comparePwd = await pwdCompare(password, userExist.password);
    if (comparePwd) {
      const accessToken = jwt.sign(
        { username: userExist.username, userid: userExist._id },
        process.env.JWT_SECRET,
        { expiresIn: "10s" }
      );
      const refreshToken = jwt.sign(
        { username: userExist.username, userid: userExist._id },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
      res.status(200).json({ accessToken });
    } else {
      res.status(400).json({
        message: "Wrong Password"
      });
    }
  } else {
    res.status(400).json({
      message: "Incorrect Username Or Email"
    });
  }
};

const refresh = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.status(401).json({ message: "Unauthorized" });
  const refreshToken = cookies.jwt;

  jwt.verify(refreshToken, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ message: "Forbidden" });
    const user = await User.findOne({ username: decoded.username });
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    const accessToken = jwt.sign(
      {
        ...user
      },
      process.env.JWT_SECRET
    );

    res.json({ accessToken });
  });
};

const logout = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.status(204);
  res.clearCookie("jwt", { httpOnly: true, sameSite: "None", secure: true });
  res.json({ message: "cookie cleared" });
};

const update = async (req, res) => {
  const { query, password, username } = req.body;
  try {
    if (query?.password) {
      const comparePwd = await pwdCompare(password);
      if (!comparePwd)
        return res.status(400).json({ message: "Wrong Password" });
      await User.findOneAndUpdate({ username }, { $set: { ...query } });
      return res.status(200).json({ message: "User updated successfully" });
    }
    await User.findOneAndUpdate({ username }, { $set: { ...query } });
    res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Somethng went wrong. Try again", err });
  }
};

module.exports = {
  register,
  checkUsername,
  getUser,
  login,
  refresh,
  logout,
  update
};
