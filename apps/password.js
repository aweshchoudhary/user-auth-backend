const bcrypt = require("bcryptjs");

const pwdHash = async (pwd) => {
  const hashedPassword = await bcrypt.hash(pwd, 10);
  return hashedPassword;
};

const pwdCompare = async (pwd, hashedPassword) => {
  const ComparedPassword = await bcrypt.compare(pwd, hashedPassword);
  return ComparedPassword;
};

module.exports = { pwdHash, pwdCompare };
