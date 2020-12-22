const bcrypt = require("bcrypt");
const crypto = require("crypto");

const baseController = require("./base.controler");
const notificationController = require("./notification.controller");
const userRepository = require("../repository/user.repository");

const constantsUtils = require("../utils/constants.utils");

const logger = require("../controllers/logger.controller");

const DATABASE_TASK_EXECUTION = 1;

exports.healthCheck = async (req, res) =>  {
  const healthCheck = {
		uptime: process.uptime(),
		message: 'OK',
		timestamp: Date.now()
	};
	try {
		res.send(healthCheck);
	} catch (e) {
		healthCheck.message = e;
		res.status(constantsUtils.STATUS_CODE_SERVICE_UNAVAILABLE).send();
	}
};

exports.create = async (axios, req, res) => {
  const userRequest = req.body;

  const validation = validateUserData(userRequest);
  if (validation.hasError) {
    logger.log("create", validation.message);
    return res.status(validation.errorCode).send({ error: validation.message });
  }

  try {
    const user = await convertIntoPersistable(userRequest);
    const loadedUser = await userRepository.findOne(
      baseController.buildOrConditionBy(userRequest.userName, userRequest.email)
    );

    if (loadedUser) {
      logger.log("create", constantsUtils.ERROR_MESSAGE_USER_ALREADY_EXISTS);
      return res
        .status(constantsUtils.STATUS_CODE_BAD_REQUEST)
        .send({ error: constantsUtils.ERROR_MESSAGE_USER_ALREADY_EXISTS });
    }

    const newUser = await userRepository.create(user);
    const token = await getToken(axios, {
      id: newUser.id,
      status: newUser.status,
      roles: newUser.roles,
    });

    if (!token) {
      logger.log("create", constantsUtils.ERROR_MESSAGE_CREATING_USER);
      return res
        .status(constantsUtils.STATUS_CODE_BAD_REQUEST)
        .send({ error: constantsUtils.ERROR_MESSAGE_CREATING_USER });
    }

    const readUser = convertIntoReadable(newUser);
    res.send({ user: readUser, token: token });
  } catch (err) {
    logger.log("create", constantsUtils.ERROR_MESSAGE_CREATING_USER, err);

    res
      .status(constantsUtils.STATUS_CODE_INTERNAL_SERVER_ERROR)
      .send({ error: constantsUtils.ERROR_MESSAGE_CREATING_USER });
  }
};

exports.findAll = async (req, res) => {
  userRepository
    .findAll()
    .then((data) => {
      res.send(convertIntoReadableList(data));
    })
    .catch((err) => {
      logger.log("findAll", "Some error occurred while retrieving users.", err);
      res.status(constantsUtils.STATUS_CODE_INTERNAL_SERVER_ERROR).send({
        error: err.message || "Some error occurred while retrieving users.",
      });
    });
};

exports.findOne = async (req, res) => {
  const conditionParameterValue = req.params.userNameOrEmail;
  try {
    const loadedUser = await userRepository.findOne(
      baseController.buildOrConditionBy(
        conditionParameterValue,
        conditionParameterValue
      )
    );

    if (loadedUser) {
      const user = convertIntoReadable(loadedUser);
      res.send(user);
    } else {
      logger.log("findOne", constantsUtils.ERROR_MESSAGE_USER_DOES_NOT_EXISTS_MESSAGE);
      res.status(constantsUtils.STATUS_CODE_BAD_REQUEST).send({
        error: constantsUtils.ERROR_MESSAGE_USER_DOES_NOT_EXISTS_MESSAGE,
      });
    }
  } catch (err) {
    logger.log("findOne", constantsUtils.ERROR_MESSAGE_LOADING_USER +
        ` = ${conditionParameterValue}`, err);
    res.status(constantsUtils.STATUS_CODE_INTERNAL_SERVER_ERROR).send({
      error:
        constantsUtils.ERROR_MESSAGE_LOADING_USER +
        ` = ${conditionParameterValue}`,
    });
  }
};

exports.update = async (req, res) => {
  const id = req.params.id;
  const user = req.body;

  try {
    if (!user || !user.id) {
      logger.log("update", constantsUtils.ERROR_MESSAGE_INVALID_USER_BODY);
      return res
        .status(constantsUtils.STATUS_CODE_BAD_REQUEST)
        .send({ error: constantsUtils.ERROR_MESSAGE_INVALID_USER_BODY });
    }

    if (!user.roles || isInvalidArray(user.roles)) {
      logger.log("update", constantsUtils.ERROR_MESSAGE_USER_ROLES_CANNOT_BE_EMPTY);
      return res.status(constantsUtils.STATUS_CODE_BAD_REQUEST).send({
        error: constantsUtils.ERROR_MESSAGE_USER_ROLES_CANNOT_BE_EMPTY,
      });
    }

    if (!user.status || user.status.length === 0) {
      logger.log("update", constantsUtils.ERROR_MESSAGE_USER_STATUS_CANNOT_BE_EMPTY);
      return res.status(constantsUtils.STATUS_CODE_BAD_REQUEST).send({
        error: constantsUtils.ERROR_MESSAGE_USER_STATUS_CANNOT_BE_EMPTY,
      });
    }

    if (parseInt(user.id) !== parseInt(id)) {
      logger.log("update", constantsUtils.ERROR_MESSAGE_USER_NOT_ENOUGH_RIGHTS);
      return res
        .status(constantsUtils.STATUS_CODE_BAD_REQUEST)
        .send({ error: constantsUtils.ERROR_MESSAGE_USER_NOT_ENOUGH_RIGHTS });
    }

    const loadedUser = await userRepository.findOne(
      baseController.buildAndConditionBy(user.id)
    );

    if (!loadedUser) {
      logger.log("update", constantsUtils.ERROR_MESSAGE_USER_DOES_NOT_EXISTS_MESSAGE);
      return res.status(constantsUtils.STATUS_CODE_BAD_REQUEST).send({
        error: constantsUtils.ERROR_MESSAGE_USER_DOES_NOT_EXISTS_MESSAGE,
      });
    }

    const persistableUser = await convertIntoPersistable(user);
    const result = await userRepository.update(
      persistableUser,
      baseController.buildAndConditionBy(id)
    );
    if (result == DATABASE_TASK_EXECUTION) {
      res.send();
    } else {
      logger.log("update", `Cannot update user. Maybe user was not found or req.body is empty!`);
      res.status(constantsUtils.STATUS_CODE_BAD_REQUEST).send({
        error: `Cannot update user. Maybe user was not found or req.body is empty!`,
      });
    }
  } catch (err) {
    logger.log("update", constantsUtils.ERROR_MESSAGE_INVALID_USER_BODY, err);
    res
      .status(constantsUtils.STATUS_CODE_INTERNAL_SERVER_ERROR)
      .send({ error: constantsUtils.ERROR_MESSAGE_INVALID_USER_BODY });
  }
};

exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    const result = await userRepository.delete(
      baseController.buildAndConditionBy(id)
    );

    if (result == DATABASE_TASK_EXECUTION) {
      res.send();
    } else {
      logger.log("delete", constantsUtils.ERROR_MESSAGE_USER_DOES_NOT_EXISTS_MESSAGE);
      res.status(constantsUtils.STATUS_CODE_BAD_REQUEST).send({
        error: constantsUtils.ERROR_MESSAGE_USER_DOES_NOT_EXISTS_MESSAGE,
      });
    }
  } catch (err) {
    logger.log("delete", constantsUtils.ERROR_MESSAGE_USER_DOES_NOT_EXISTS_MESSAGE, err);
    res.status(constantsUtils.STATUS_CODE_INTERNAL_SERVER_ERROR).send({
      error: constantsUtils.ERROR_MESSAGE_USER_DOES_NOT_EXISTS_MESSAGE,
    });
  }
};

exports.authenticate = async (axios, req, res) => {
  const { email, password } = req.body;
  const loadedUser = await userRepository.findOne(
    baseController.buildOrConditionBy(email, email)
  );

  if (!loadedUser) {
    return res.status(constantsUtils.STATUS_CODE_BAD_REQUEST).send({
      error: constantsUtils.ERROR_MESSAGE_USER_DOES_NOT_EXISTS_MESSAGE,
    });
  }

  if (!(await bcrypt.compare(password, loadedUser.password)))
    return res
      .status(constantsUtils.STATUS_CODE_BAD_REQUEST)
      .send({ error: constantsUtils.ERROR_MESSAGE_AUTHENTICATION_FAILED });

  const token = await getToken(axios, {
    id: loadedUser.id,
    status: loadedUser.status,
    roles: loadedUser.roles,
  });

  if (!token)
    return res.status(constantsUtils.STATUS_CODE_BAD_REQUEST).send({
      error: constantsUtils.ERROR_MESSAGE_AUTHENTICATION_TOKEN_FAILED,
    });

  const user = convertIntoReadable(loadedUser);
  res.send({ user, token: token });
};

exports.forgotPassword = async (req, res) => {
  const conditionParameterValue = req.params.userNameOrEmail;
  try {
    const user = await userRepository.findOne(
      baseController.buildOrConditionBy(
        conditionParameterValue,
        conditionParameterValue
      )
    );

    if (!user) {
      return res.status(constantsUtils.STATUS_CODE_BAD_REQUEST).send({
        error: constantsUtils.ERROR_MESSAGE_USER_DOES_NOT_EXISTS_MESSAGE,
      });
    }

    const token = crypto
      .randomBytes(constantsUtils.TMP_PASSWD_HASH_SIZE)
      .toString("hex");

    const expirationTime = new Date();
    expirationTime.setHours(expirationTime.getHours() + 1);

    user.passwordResetToken = token;
    user.passwordResetExpires = expirationTime;
    const persistableUser = await convertIntoPersistable(user);
    await userRepository.update(
      persistableUser,
      baseController.buildAndConditionBy(user.id)
    );

    await notificationController.sendNotification(user.email, token);
    return res.send(convertIntoReadable(user));
  } catch (err) {
    logger.log("forgotPassword", "Error retrieving user with (email|userName) = " +
        conditionParameterValue);
    res.status(constantsUtils.STATUS_CODE_INTERNAL_SERVER_ERROR).send({
      error:
        "Error retrieving user with (email|userName) = " +
        conditionParameterValue,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, token, password } = req.body;

    if (!token) {
      logger.log("resetPassword", constantsUtils.ERROR_MESSAGE_INVALID_TOKEN_RESET_PASSWORD);
      return res.status(constantsUtils.STATUS_CODE_BAD_REQUEST).send({
        error: constantsUtils.ERROR_MESSAGE_INVALID_TOKEN_RESET_PASSWORD,
      });
    }

    const loadedUser = await userRepository.findOne(
      baseController.buildOrConditionBy(email, email)
    );

    if (!loadedUser) {
      return res.status(constantsUtils.STATUS_CODE_BAD_REQUEST).send({
        error: constantsUtils.ERROR_MESSAGE_USER_DOES_NOT_EXISTS_MESSAGE,
      });
    }

    if (!loadedUser.passwordResetToken || !loadedUser.passwordResetExpires) {
      logger.log("resetPassword", constantsUtils.ERROR_MESSAGE_INVALID_TOKEN_RESET_PASSWORD);
      return res.status(constantsUtils.STATUS_CODE_BAD_REQUEST).send({
        error: constantsUtils.ERROR_MESSAGE_INVALID_TOKEN_RESET_PASSWORD,
      });
    }

    if (token !== loadedUser.passwordResetToken) {
      return res
        .status(constantsUtils.STATUS_CODE_BAD_REQUEST)
        .send({ error: constantsUtils.ERROR_MESSAGE_INVALID_TOKEN });
    }

    const now = new Date();

    if (now > loadedUser.passwordResetExpires) {
      return res.status(constantsUtils.STATUS_CODE_BAD_REQUEST).send({
        error: constantsUtils.ERROR_MESSAGE_RESET_PASSWORD_TOKEN_EXPIRED,
      });
    }

    loadedUser.password = password;
    loadedUser.passwordResetExpires = null;
    loadedUser.passwordResetToken = null;

    const persistableUser = await convertIntoPersistable(loadedUser);
    await userRepository.update(
      persistableUser,
      baseController.buildAndConditionBy(loadedUser.id)
    );
    res.send(convertIntoReadable(loadedUser));
  } catch (err) {
    logger.log("resetPassword", "Cannot reset password, try again.", err);
    res
      .status(constantsUtils.STATUS_CODE_INTERNAL_SERVER_ERROR)
      .send({ error: "Cannot reset password, try again." });
  }
};

async function getToken(axios, params = {}) {
  var token = null;
  try {
    const response = await axios.post(
      `http://${process.env.TOKEN_SERVICE_URL}:${process.env.TOKEN_SERVICE_PORT}/api/v0/auth/generateToken`,
      {
        data: params,
      }
    );

    token = response.data.token;
  } catch (error) {
    logger.log("getToken", error);
  }
  return token;
}

async function convertIntoPersistable(user) {
  const persistable = {
    userName: user.userName,
    email: user.email,
    password: await bcrypt.hash(user.password, constantsUtils.PASSWD_HASH_SIZE),
  };

  var roles = "";
  if (!user.roles || user.roles.length === 0) roles = "user";
  else roles = convertArrayIntoString(user.roles);

  persistable.roles = roles;

  if (!user.status || user.status === "") persistable.status = "active";
  else persistable.status = user.status;

  if (user.passwordResetToken)
    persistable.passwordResetToken = user.passwordResetToken;

  if (user.passwordResetExpires)
    persistable.passwordResetExpires = user.passwordResetExpires;

  return persistable;
}

function convertIntoReadable(user) {
  const roles = user.roles.length === 0 ? [] : user.roles.split(";");

  const readUser = {
    id: user.id,
    userName: user.userName,
    email: user.email,
    status: user.status,
    roles: roles,
  };

  if (user.passwordResetToken)
    readUser.passwordResetToken = user.passwordResetToken;

  return readUser;
}

function convertIntoReadableList(users) {
  const readableUsers = [];
  for (var i = 0; i < users.length; i++) {
    readableUsers.push(convertIntoReadable(users[i]));
  }
  return readableUsers;
}

const convertArrayIntoString = (exports.convertArrayIntoString = function (
  roles
) {
  var result = "";

  if (!roles) return result;

  for (var i = 0; i < roles.length; i++) {
    if (roles[i] == null || roles[i] == undefined) continue;

    if (i === 0) result += `${roles[i]}`;
    else result += `;${roles[i]}`;
  }

  return result;
});

const isInvalidArray = (exports.isInvalidArray = function (values) {
  if (!values || !Array.isArray(values)) return true;

  var filtered = values.filter(function (el) {
    return el != null;
  });

  return filtered.length === 0;
});

function validateUserData(userRequest) {
  if (!userRequest.userName) {
    return {
      errorCode: constantsUtils.STATUS_CODE_BAD_REQUEST,
      message: constantsUtils.ERROR_MESSAGE_USER_NAME_CANNOT_BE_EMPTY,
      hasError: true,
    };
  }

  if (!userRequest.email) {
    return {
      errorCode: constantsUtils.STATUS_CODE_BAD_REQUEST,
      message: constantsUtils.ERROR_MESSAGE_EMAIL_CANNOT_BE_EMPTY,
      hasError: true,
    };
  }

  if (!userRequest.password) {
    return {
      errorCode: constantsUtils.STATUS_CODE_BAD_REQUEST,
      message: constantsUtils.ERROR_MESSAGE_PASSWORD_CANNOT_BE_EMPTY,
      hasError: true,
    };
  }
  return { hasError: false };
}