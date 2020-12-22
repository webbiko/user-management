const Op = require('sequelize').Op;

exports.buildOrConditionBy = (userName, email) => {
    const condition = {
        [Op.or]: [
            { userName: userName },
            { email: email }
        ]
    }
    return condition;
}

exports.buildAndConditionBy = (id) => {
    const condition = {
        [Op.and]: [
            { id: id }
        ]
    }
    return condition;
}

exports.buildAndConditionByUserId = (userId) => {
    const condition = {
        [Op.and]: [
            { userId: userId }
        ]
    }
    return condition;
}