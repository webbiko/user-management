const constantsUtils = require("../utils/constants.utils");

module.exports = (axios) => async function (req, res, next) {

    var token = req.get("Authorization");
    try {
        const response = await axios.get(
          `http://${process.env.TOKEN_SERVICE_URL}:${process.env.TOKEN_SERVICE_PORT}/api/v0/auth/validateUserStatus`,
          {
            headers: {
              "X-User-Token": token,
            },
          }
        );

        if (response.data.authorized)
            next();
    } catch (error) {
        res.status(constantsUtils.STATUS_CODE_ACCESS_UNAUTHORIZED)
            .send({ error: constantsUtils.ERROR_MESSAGE_USER_NOT_ENOUGH_RIGHTS });
    }
}