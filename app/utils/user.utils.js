const fs = require("fs");
const path = require("path");

const db = require("../models");
const User = db.user;

const baseController = require("../controllers/base.controler");

// methods used only for testing beginning

module.exports.DEFAULT_USER_TEST = {
  id: null,
  userName: "test",
  password: "12345",
  email: "test@gmail.com",
  status: "active",
  roles: ["user"],
};

module.exports.DEFAULT_USER_WITH_MULTIPLE_ROLES_TEST = {
  id: null,
  userName: "test",
  password: "12345",
  email: "test@gmail.com",
  status: "active",
  roles: ["user", "admin"],
};

module.exports.update = async (user) => {
  return User.update(user, {
    where: baseController.buildAndConditionBy(user.id),
  });
};

module.exports.createUserForTest = async (user) => {
  return User.create(user);
};

module.exports.cleanUserTable = async () => {
  await User.destroy({
    where: {},
    force: true,
  });
};
