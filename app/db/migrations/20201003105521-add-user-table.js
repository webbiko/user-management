'use strict';

const constantUtils = require("./../../utils/constants.utils")

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('user', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                unique: true,
                primaryKey: true
            },
            userName: {
                type: Sequelize.STRING,
                allowNull: false
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                validate: {
                    isEmail: true
                }
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            passwordResetToken: {
                type: Sequelize.STRING
            },
            passwordResetExpires: {
                type: Sequelize.DATE
            },
            isPremium: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            status: {
                type: Sequelize.ENUM,
                values: [
                    constantUtils.ACTIVE_USER_STATUS,
                    constantUtils.INNACTIVE_USER_STATUS,
                    constantUtils.BANNED_USER_STATUS,
                    constantUtils.DELETED_USER_STATUS],
                allowNull: false,
                defaultValue: "active",
                validate: {
                    isIn: [[
                        constantUtils.ACTIVE_USER_STATUS,
                        constantUtils.INNACTIVE_USER_STATUS,
                        constantUtils.BANNED_USER_STATUS,
                        constantUtils.DELETED_USER_STATUS]]
                }
            },
            roles: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: "user",
                validate: {
                    notEmpty: true,
                    notNull: true
                }
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: true,
                type: Sequelize.DATE
            },
            deletedAt: {
                allowNull: true,
                type: Sequelize.DATE
            }
        }, {
            paranoid: true,
            createdAt: "createTimestamp",
            updatedAt: 'updateTimestamp',
            deletedAt: 'destroyTime',
            freezeTableName: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('user');
    }
};