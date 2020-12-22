'use strict';

const { DataTypes, Model } = require('sequelize');
const constantUtils = require("../utils/constants.utils");

module.exports = function (sequelize) {
    class User extends Model {
        static associate(models) {
            // define association here
        }
    }
    User.init({
        userName: DataTypes.STRING,
        email: DataTypes.STRING,
        password: DataTypes.STRING,
        passwordResetToken: DataTypes.STRING,
        passwordResetExpires: DataTypes.DATE,
        isPremium: DataTypes.BOOLEAN,
        status: {
            type: DataTypes.ENUM,
            defaultValue: constantUtils.ACTIVE_USER_STATUS,
            values: [
                constantUtils.ACTIVE_USER_STATUS,
                constantUtils.INNACTIVE_USER_STATUS,
                constantUtils.BANNED_USER_STATUS,
                constantUtils.DELETED_USER_STATUS]
        },
        roles: {
            type: DataTypes.STRING,
            defaultValue: "user"
        }
    }, {
        sequelize,
        modelName: "user",
        paranoid: true,
        freezeTableName: true
    });
    return User;
}