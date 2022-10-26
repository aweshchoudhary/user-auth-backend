const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const port = process.env.PORT || 8000;
const auth_routes = require("./routes/auth-routes");
require("./database/connect");
const session = require("express-session");
const cookie = require("cookie-parser");
const cors = require("cors");
const morgan = require("morgan");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: ["https://csb-1npiyo.netlify.app", "https://1npiyo.csb.app", "https://user-auth0.netlify.app"],
    credentials: true
  })
);

app.use(morgan("dev"));
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false
  })
);
app.use(cookie());

app.use("/auth", auth_routes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
