const db = require("../models");
const User = db.user;

exports.findAll = async () => {
    return User.findAll();
}

exports.findOne = async (condition) => {
    return User.findOne({ where: condition, raw: true });
}

exports.update = async (user, condition) => {
    return User.update(user, { where: condition });
}

exports.create = async (user) => {
    return User.create(user);
}

exports.delete = async (condition) => {
    return User.destroy({ where: condition });
}