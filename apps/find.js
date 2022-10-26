const User = require("../database/schema/user");

const find = async (query, value) => {
  const boolean = await User.findOne({ [query]: value });
  return boolean;
};

module.exports = find;
