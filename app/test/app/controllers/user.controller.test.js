/* eslint-disable no-undef */
const crypto = require("crypto");
const constantsUtils = require("../../../utils/constants.utils");
const userController = require("../../../controllers/user.controller");

const request = require("supertest");
const app = require("../../../server/server");

const userUtils = require("../../../utils/user.utils");

var currentUser = null;

const MockAdapter = require("axios-mock-adapter");

const mock = new MockAdapter(app.axios);

mock
  .onPost(
    `http://localhost:${process.env.TOKEN_SERVICE_PORT}/api/v0/auth/generateToken`
  )
  .reply(200, {
    token: "abcdefghijklmnopqrstuvxyzw",
  });

beforeEach(async function (done) {
  await userUtils.cleanUserTable();

  const userResponse = await request(app)
    .post("/api/v0/users/register")
    .send(userUtils.DEFAULT_USER_TEST);

  currentUser = userResponse.body.user;
  userUtils.DEFAULT_USER_TEST.id = currentUser.id;
  userUtils.DEFAULT_USER_TEST.status = "active";
  done();
});

describe("POST /api/v0/users/register", () => {
  test("Test that user creation is not allowed since user name is not provided", async () => {
    const response = await request(app).post("/api/v0/users/register").send({
      email: userUtils.DEFAULT_USER_TEST.email,
      password: userUtils.DEFAULT_USER_TEST.password,
    });

    expect(response.status).toBe(constantsUtils.STATUS_CODE_BAD_REQUEST);
    expect(response.body.error).toBe(
      constantsUtils.ERROR_MESSAGE_USER_NAME_CANNOT_BE_EMPTY
    );
  });

  test("Test that user creation is not allowed since email is not provided", async () => {
    const response = await request(app).post("/api/v0/users/register").send({
      userName: userUtils.DEFAULT_USER_TEST.userName,
      password: userUtils.DEFAULT_USER_TEST.password,
    });

    expect(response.status).toBe(constantsUtils.STATUS_CODE_BAD_REQUEST);
    expect(response.body.error).toBe(
      constantsUtils.ERROR_MESSAGE_EMAIL_CANNOT_BE_EMPTY
    );
  });

  test("Test that user creation is not allowed since password is not provided", async () => {
    const response = await request(app).post("/api/v0/users/register").send({
      userName: userUtils.DEFAULT_USER_TEST.userName,
      email: userUtils.DEFAULT_USER_TEST.email,
    });

    expect(response.status).toBe(constantsUtils.STATUS_CODE_BAD_REQUEST);
    expect(response.body.error).toBe(
      constantsUtils.ERROR_MESSAGE_PASSWORD_CANNOT_BE_EMPTY
    );
  });

  test("Test that user creation is not allowed since user already exists", async () => {
    const response = await request(app)
      .post("/api/v0/users/register")
      .send(userUtils.DEFAULT_USER_TEST);

    expect(response.status).toBe(constantsUtils.STATUS_CODE_BAD_REQUEST);
    expect(response.body.error).toBe(
      constantsUtils.ERROR_MESSAGE_USER_ALREADY_EXISTS
    );
  });

  test("Test that user creation succeed", async () => {
    await userUtils.cleanUserTable();

    const response = await request(app)
      .post("/api/v0/users/register")
      .send(userUtils.DEFAULT_USER_TEST);

    expect(response.status).toBe(constantsUtils.STATUS_CODE_OK);
  });

  test("Test that user creation succeed and new user matches with the one sent to the backend", async () => {
    await userUtils.cleanUserTable();

    const response = await request(app)
      .post("/api/v0/users/register")
      .send(userUtils.DEFAULT_USER_TEST);

    const newUser = response.body.user;
    const freshToken = response.body.token;

    expect(freshToken).not.toBeNull();
    expect(freshToken.length).not.toBe(0);

    expect(newUser).not.toBeNull();
    expect(newUser.userName).toBe(userUtils.DEFAULT_USER_TEST.userName);
    expect(newUser.email).toBe(userUtils.DEFAULT_USER_TEST.email);
    expect(newUser.status).toBe(userUtils.DEFAULT_USER_TEST.status);

    expect(Array.isArray(newUser.roles)).toBeTruthy();
    expect(newUser.roles.length).toBe(userUtils.DEFAULT_USER_TEST.roles.length);

    for (var i = 0; i < userUtils.DEFAULT_USER_TEST.roles.length; i++) {
      expect(newUser.roles[i]).toBe(userUtils.DEFAULT_USER_TEST.roles[i]);
    }
  });

  test("Test that user creation succeed and new user matches with the one sent to the backend when no roles are sent", async () => {
    await userUtils.cleanUserTable();

    const response = await request(app).post("/api/v0/users/register").send({
      userName: "test",
      password: "12345",
      email: "test@gmail.com",
      status: "active",
    });

    const newUser = response.body.user;
    const freshToken = response.body.token;

    expect(freshToken).not.toBeNull();
    expect(freshToken.length).not.toBe(0);

    expect(newUser).not.toBeNull();
    expect(newUser.userName).toBe(userUtils.DEFAULT_USER_TEST.userName);
    expect(newUser.email).toBe(userUtils.DEFAULT_USER_TEST.email);
    expect(newUser.status).toBe(userUtils.DEFAULT_USER_TEST.status);

    expect(Array.isArray(newUser.roles)).toBeTruthy();
    expect(newUser.roles.length).toBe(userUtils.DEFAULT_USER_TEST.roles.length);

    for (var i = 0; i < userUtils.DEFAULT_USER_TEST.roles.length; i++) {
      expect(newUser.roles[i]).toBe(userUtils.DEFAULT_USER_TEST.roles[i]);
    }
  });

  test("Test that user creation succeed and new user matches with the one sent to the backend when no status is sent", async () => {
    await userUtils.cleanUserTable();

    const response = await request(app)
      .post("/api/v0/users/register")
      .send({
        userName: "test",
        password: "12345",
        email: "test@gmail.com",
        roles: ["user"],
      });

    const newUser = response.body.user;
    const freshToken = response.body.token;

    expect(freshToken).not.toBeNull();
    expect(freshToken.length).not.toBe(0);

    expect(newUser).not.toBeNull();
    expect(newUser.userName).toBe(userUtils.DEFAULT_USER_TEST.userName);
    expect(newUser.email).toBe(userUtils.DEFAULT_USER_TEST.email);
    expect(newUser.status).toBe(userUtils.DEFAULT_USER_TEST.status);

    expect(Array.isArray(newUser.roles)).toBeTruthy();
    expect(newUser.roles.length).toBe(userUtils.DEFAULT_USER_TEST.roles.length);

    for (var i = 0; i < userUtils.DEFAULT_USER_TEST.roles.length; i++) {
      expect(newUser.roles[i]).toBe(userUtils.DEFAULT_USER_TEST.roles[i]);
    }
  });

  test("Test that user creation succeed and new user matches with the one sent to the backend when status is sent as empty", async () => {
    await userUtils.cleanUserTable();

    const response = await request(app)
      .post("/api/v0/users/register")
      .send({
        userName: "test",
        password: "12345",
        email: "test@gmail.com",
        status: "",
        roles: ["user"],
      });

    const newUser = response.body.user;
    const freshToken = response.body.token;

    expect(freshToken).not.toBeNull();
    expect(freshToken.length).not.toBe(0);

    expect(newUser).not.toBeNull();
    expect(newUser.userName).toBe(userUtils.DEFAULT_USER_TEST.userName);
    expect(newUser.email).toBe(userUtils.DEFAULT_USER_TEST.email);
    expect(newUser.status).toBe(userUtils.DEFAULT_USER_TEST.status);

    expect(Array.isArray(newUser.roles)).toBeTruthy();
    expect(newUser.roles.length).toBe(userUtils.DEFAULT_USER_TEST.roles.length);

    for (var i = 0; i < userUtils.DEFAULT_USER_TEST.roles.length; i++) {
      expect(newUser.roles[i]).toBe(userUtils.DEFAULT_USER_TEST.roles[i]);
    }
  });

  test("Test that user creation succeed and new user matches with the one sent to the backend when roles are sent as empty", async () => {
    await userUtils.cleanUserTable();

    const response = await request(app).post("/api/v0/users/register").send({
      userName: "test",
      password: "12345",
      email: "test@gmail.com",
      status: "active",
      roles: [],
    });

    const newUser = response.body.user;
    const freshToken = response.body.token;

    expect(freshToken).not.toBeNull();
    expect(freshToken.length).not.toBe(0);

    expect(newUser).not.toBeNull();
    expect(newUser.userName).toBe(userUtils.DEFAULT_USER_TEST.userName);
    expect(newUser.email).toBe(userUtils.DEFAULT_USER_TEST.email);
    expect(newUser.status).toBe(userUtils.DEFAULT_USER_TEST.status);

    expect(Array.isArray(newUser.roles)).toBeTruthy();
    expect(newUser.roles.length).toBe(userUtils.DEFAULT_USER_TEST.roles.length);

    for (var i = 0; i < userUtils.DEFAULT_USER_TEST.roles.length; i++) {
      expect(newUser.roles[i]).toBe(userUtils.DEFAULT_USER_TEST.roles[i]);
    }
  });

  test("Test that user creation succeed and new user matches with the one sent to the backend when multiple roles are sent", async () => {
    await userUtils.cleanUserTable();

    const response = await request(app)
      .post("/api/v0/users/register")
      .send(userUtils.DEFAULT_USER_WITH_MULTIPLE_ROLES_TEST);

    const newUser = response.body.user;
    const freshToken = response.body.token;

    expect(freshToken).not.toBeNull();
    expect(freshToken.length).not.toBe(0);

    expect(newUser).not.toBeNull();
    expect(newUser.userName).toBe(
      userUtils.DEFAULT_USER_WITH_MULTIPLE_ROLES_TEST.userName
    );
    expect(newUser.email).toBe(
      userUtils.DEFAULT_USER_WITH_MULTIPLE_ROLES_TEST.email
    );
    expect(newUser.status).toBe(
      userUtils.DEFAULT_USER_WITH_MULTIPLE_ROLES_TEST.status
    );

    expect(Array.isArray(newUser.roles)).toBeTruthy();
    expect(newUser.roles.length).toBe(
      userUtils.DEFAULT_USER_WITH_MULTIPLE_ROLES_TEST.roles.length
    );

    for (
      var i = 0;
      i < userUtils.DEFAULT_USER_WITH_MULTIPLE_ROLES_TEST.roles.length;
      i++
    ) {
      expect(newUser.roles[i]).toBe(
        userUtils.DEFAULT_USER_WITH_MULTIPLE_ROLES_TEST.roles[i]
      );
    }
  });
});

describe("GET /api/v0/users", () => {
  test("Test that api returns success", async () => {
    const response = await request(app).get("/api/v0/users");

    expect(response.status).toBe(constantsUtils.STATUS_CODE_OK);
  });

  test("Test that returns empty array when no user is persisted", async () => {
    await userUtils.cleanUserTable();
    const response = await request(app).get("/api/v0/users");

    const users = response.body;
    expect(users.length).toBe(0);
    expect(response.status).toBe(constantsUtils.STATUS_CODE_OK);
  });

  test("Test that all users are returned when database contains only one persisted", async () => {
    const response = await request(app).get("/api/v0/users");

    const users = response.body;

    expect(users.length).toBe(1);
    expect(response.status).toBe(constantsUtils.STATUS_CODE_OK);
  });

  test("Test that all users are returned when database contains only one persisted", async () => {
    await userUtils.cleanUserTable();
    const numberOfUsers = 5;
    var users = [];
    for (var i = 0; i < numberOfUsers; i++) {
      const userName = `user${i}`;
      const password = `12345${i}`;
      const email = `user-test${i}@gmail.com`;

      const user = { userName: userName, password: password, email: email };
      users[i] = await userUtils.createUserForTest(user);
    }

    const response = await request(app).get("/api/v0/users");

    const loadedUsers = response.body;
    expect(loadedUsers.length).toBe(users.length);
    expect(response.status).toBe(constantsUtils.STATUS_CODE_OK);

    for (i = 0; i < numberOfUsers; i++) {
      expect(loadedUsers[i].userName).toBe(users[i].userName);
      expect(loadedUsers[i].email).toBe(users[i].email);
      expect(loadedUsers[i].password).toBe(undefined);
    }
  });
});

describe("GET /api/v0/users/:userNameOrEmail", () => {
  test("Test that user is loaded when email is sent", async () => {
    const response = await request(app).get(
      `/api/v0/users/${currentUser.email}`
    );

    const user = response.body;
    expect(Array.isArray(user)).toBeFalsy();
    expect(user.userName).toBe(currentUser.userName);
    expect(user.password).toBe(undefined);
    expect(user.email).toBe(currentUser.email);
    expect(response.status).toBe(constantsUtils.STATUS_CODE_OK);
  });

  test("Test that user is loaded when userName is sent", async () => {
    const response = await request(app).get(
      `/api/v0/users/${currentUser.userName}`
    );

    const user = response.body;
    expect(Array.isArray(user)).toBeFalsy();
    expect(user.userName).toBe(currentUser.userName);
    expect(user.password).toBe(undefined);
    expect(user.email).toBe(currentUser.email);
    expect(response.status).toBe(constantsUtils.STATUS_CODE_OK);
  });

  test("Test that user is not loaded when user is not found", async () => {
    const response = await request(app).get(`/api/v0/users/invalidUserName`);

    expect(response.status).toBe(constantsUtils.STATUS_CODE_BAD_REQUEST);
    expect(response.body.error).toBe(
      constantsUtils.ERROR_MESSAGE_USER_DOES_NOT_EXISTS_MESSAGE
    );
  });
});

describe("PUT /api/v0/users/:id", () => {
  test("Test that an internal server error occurrs when we send a invalid json", async () => {
    const response = await request(app)
      .put(`/api/v0/users/${currentUser.id}`)
      .send(null);

    expect(response.status).toBe(constantsUtils.STATUS_CODE_BAD_REQUEST);
    expect(response.body.error).toBe(
      constantsUtils.ERROR_MESSAGE_INVALID_USER_BODY
    );
  });

  test("Test that user is not loaded when no user matches id sent", async () => {
    userUtils.DEFAULT_USER_TEST.id = 19876;
    const response = await request(app)
      .put(`/api/v0/users/19876`)
      .send(userUtils.DEFAULT_USER_TEST);

    expect(response.status).toBe(constantsUtils.STATUS_CODE_BAD_REQUEST);
    expect(response.body.error).toBe(
      constantsUtils.ERROR_MESSAGE_USER_DOES_NOT_EXISTS_MESSAGE
    );
  });

  test("Test that user is updated properly", async () => {
    const newEmail = "testNewEmailUpdate@gmail.com";
    const newUser = userUtils.DEFAULT_USER_TEST;
    newUser.id = currentUser.id;
    newUser.email = newEmail;

    const response = await request(app)
      .put(`/api/v0/users/${currentUser.id}`)
      .send(newUser);

    expect(response.status).toBe(constantsUtils.STATUS_CODE_OK);
  });

  test("Test that user role is updated properly", async () => {
    var response = await request(app).get(
      `/api/v0/users/${currentUser.userName}`
    );

    var loadedUser = response.body;
    expect(loadedUser.roles.length).toBe(1);
    expect(loadedUser.roles[0]).toBe(userUtils.DEFAULT_USER_TEST.roles[0]);

    const newUser = userUtils.DEFAULT_USER_TEST;
    newUser.roles = userUtils.DEFAULT_USER_WITH_MULTIPLE_ROLES_TEST.roles;

    response = await request(app)
      .put(`/api/v0/users/${currentUser.id}`)
      .send(newUser);

    expect(response.status).toBe(constantsUtils.STATUS_CODE_OK);

    response = await request(app).get(`/api/v0/users/${currentUser.userName}`);

    loadedUser = response.body;
    expect(loadedUser.roles.length).toBe(2);
    for (var i = 0; i < loadedUser.roles.length; i++)
      expect(loadedUser.roles[i]).toBe(userUtils.DEFAULT_USER_TEST.roles[i]);
  });

  test("Test that user role is updated properly by removing one role", async () => {
    await userUtils.cleanUserTable();
    userUtils.DEFAULT_USER_WITH_MULTIPLE_ROLES_TEST.roles = "user;admin";
    const user = await userUtils.createUserForTest(
      userUtils.DEFAULT_USER_WITH_MULTIPLE_ROLES_TEST
    );
    user.roles = user.roles.split(";");
    var response = await request(app).get(`/api/v0/users/${user.userName}`);

    var loadedUser = response.body;
    expect(loadedUser.roles.length).toBe(2);

    delete user.roles[1];

    const userToDeleteRole = {
      id: user.id,
      userName: user.userName,
      password: user.password,
      email: user.email,
      status: user.status,
      roles: user.roles,
    };

    response = await request(app)
      .put(`/api/v0/users/${user.id}`)
      .send(userToDeleteRole);

    expect(response.status).toBe(constantsUtils.STATUS_CODE_OK);

    response = await request(app).get(`/api/v0/users/${user.userName}`);

    loadedUser = response.body;
    expect(loadedUser.roles.length).toBe(1);
    expect(loadedUser.roles[0]).toBe(userUtils.DEFAULT_USER_TEST.roles[0]);
  });

  test("Test that user role is not updated properly by removing the last role in list", async () => {
    await userUtils.cleanUserTable();
    userUtils.DEFAULT_USER_TEST.roles = "user";

    const user = await userUtils.createUserForTest(userUtils.DEFAULT_USER_TEST);
    user.roles = ["user"];
    var response = await request(app).get(`/api/v0/users/${user.userName}`);

    var loadedUser = response.body;
    expect(loadedUser.roles.length).toBe(1);

    delete user.roles[0];

    const userToDeleteRole = {
      id: user.id,
      userName: user.userName,
      password: user.password,
      email: user.email,
      status: user.status,
      roles: user.roles,
    };

    response = await request(app)
      .put(`/api/v0/users/${user.id}`)
      .send(userToDeleteRole);

    expect(response.status).toBe(constantsUtils.STATUS_CODE_BAD_REQUEST);
    expect(response.body.error).toBe(
      constantsUtils.ERROR_MESSAGE_USER_ROLES_CANNOT_BE_EMPTY
    );
  });

  test("Test that user role is not updated properly when it is empty", async () => {
    var user = await userUtils.createUserForTest({
      userName: "my name",
      password: "12345",
      email: "myname@gmail.com",
      status: "active",
      roles: "user",
    });

    user = user.dataValues;
    var response = await request(app).get(`/api/v0/users/${user.userName}`);

    var loadedUser = response.body;
    expect(loadedUser.status).toBe("active");

    const newUser = loadedUser;
    newUser.roles = [];

    response = await request(app)
      .put(`/api/v0/users/${loadedUser.id}`)
      .send(newUser);

    expect(response.status).toBe(constantsUtils.STATUS_CODE_BAD_REQUEST);
    expect(response.body.error).toBe(
      constantsUtils.ERROR_MESSAGE_USER_ROLES_CANNOT_BE_EMPTY
    );
  });

  test("Test that user role is not updated properly when it is null", async () => {
    var user = await userUtils.createUserForTest({
      userName: "my name",
      password: "12345",
      email: "myname@gmail.com",
      status: "active",
      roles: "user",
    });

    user = user.dataValues;
    var response = await request(app).get(`/api/v0/users/${user.userName}`);

    var loadedUser = response.body;

    expect(loadedUser.status).toBe("active");

    const newUser = loadedUser;
    newUser.roles = null;

    response = await request(app)
      .put(`/api/v0/users/${loadedUser.id}`)
      .send(newUser);

    expect(response.status).toBe(constantsUtils.STATUS_CODE_BAD_REQUEST);
    expect(response.body.error).toBe(
      constantsUtils.ERROR_MESSAGE_USER_ROLES_CANNOT_BE_EMPTY
    );
  });

  test("Test that user role is not updated properly when it is missing", async () => {
    var user = await userUtils.createUserForTest({
      userName: "my name",
      password: "12345",
      email: "myname@gmail.com",
      status: "active",
      roles: "user",
    });

    user = user.dataValues;
    var response = await request(app).get(`/api/v0/users/${user.userName}`);

    var loadedUser = response.body;
    expect(loadedUser.status).toBe("active");

    const newUser = {
      id: loadedUser.id,
      userName: loadedUser.userName,
      password: loadedUser.password,
      email: loadedUser.email,
      status: loadedUser.status,
    };

    response = await request(app)
      .put(`/api/v0/users/${loadedUser.id}`)
      .send(newUser);

    expect(response.status).toBe(constantsUtils.STATUS_CODE_BAD_REQUEST);
    expect(response.body.error).toBe(
      constantsUtils.ERROR_MESSAGE_USER_ROLES_CANNOT_BE_EMPTY
    );
  });

  test("Test that user status is updated properly", async () => {
    var response = await request(app).get(
      `/api/v0/users/${currentUser.userName}`
    );

    var loadedUser = response.body;
    expect(loadedUser.status).toBe("active");

    const newUser = {
      id: userUtils.DEFAULT_USER_TEST.id,
      userName: userUtils.DEFAULT_USER_TEST.userName,
      password: userUtils.DEFAULT_USER_TEST.password,
      email: userUtils.DEFAULT_USER_TEST.email,
      status: "innactive",
      roles: ["user"], // if i use the one from the default user roles become string then test fails
    };

    response = await request(app)
      .put(`/api/v0/users/${currentUser.id}`)
      .send(newUser);

    expect(response.status).toBe(constantsUtils.STATUS_CODE_OK);

    response = await request(app).get(`/api/v0/users/${currentUser.userName}`);

    loadedUser = response.body;
    expect(loadedUser.status).toBe("innactive");
  });

  test("Test that user status is not updated properly when it is empty", async () => {
    const user = await userUtils.createUserForTest({
      id: null,
      userName: "my name",
      password: "12345",
      email: "myname@gmail.com",
      status: "active",
      roles: "user",
    });
    var response = await request(app).get(`/api/v0/users/${user.userName}`);

    var loadedUser = response.body;
    expect(loadedUser.status).toBe("active");

    const newUser = {
      id: loadedUser.id,
      userName: "test",
      password: "12345",
      email: "test@gmail.com",
      status: "",
      roles: ["user"],
    };

    response = await request(app).put(`/api/v0/users/${user.id}`).send(newUser);

    expect(response.status).toBe(constantsUtils.STATUS_CODE_BAD_REQUEST);
    expect(response.body.error).toBe(
      constantsUtils.ERROR_MESSAGE_USER_STATUS_CANNOT_BE_EMPTY
    );
  });

  test("Test that user status is not updated properly when it is missing", async () => {
    const user = await userUtils.createUserForTest({
      id: null,
      userName: "my name",
      password: "12345",
      email: "myname@gmail.com",
      status: "active",
      roles: "user",
    });
    var response = await request(app).get(`/api/v0/users/${user.userName}`);

    var loadedUser = response.body;
    expect(loadedUser.status).toBe("active");

    const newUser = {
      id: loadedUser.id,
      userName: "test",
      password: "12345",
      email: "test@gmail.com",
      roles: ["user"],
    };

    response = await request(app).put(`/api/v0/users/${user.id}`).send(newUser);

    expect(response.status).toBe(constantsUtils.STATUS_CODE_BAD_REQUEST);
    expect(response.body.error).toBe(
      constantsUtils.ERROR_MESSAGE_USER_STATUS_CANNOT_BE_EMPTY
    );
  });

  test("Test that user status is not updated properly when it is null", async () => {
    var response = await request(app).get(
      `/api/v0/users/${currentUser.userName}`
    );

    var loadedUser = response.body;
    expect(loadedUser.status).toBe("active");

    const newUser = {
      id: loadedUser.id,
      userName: "test",
      password: "12345",
      email: "test@gmail.com",
      status: null,
      roles: ["user"],
    };

    response = await request(app)
      .put(`/api/v0/users/${currentUser.id}`)
      .send(newUser);

    expect(response.status).toBe(constantsUtils.STATUS_CODE_BAD_REQUEST);
    expect(response.body.error).toBe(
      constantsUtils.ERROR_MESSAGE_USER_STATUS_CANNOT_BE_EMPTY
    );
  });

  test("Test that user is updated properly and values matches", async () => {
    var getAllUsersResponse = await request(app).get("/api/v0/users");

    var users = getAllUsersResponse.body;
    expect(users.length).toBe(1);
    expect(users[0].userName).toBe(currentUser.userName);
    expect(users[0].password).toBe(currentUser.password);
    expect(users[0].email).toBe(currentUser.email);

    const newEmail = "testNewEmailUpdate@gmail.com";
    const newUser = {
      id: currentUser.id,
      userName: userUtils.DEFAULT_USER_TEST.userName,
      password: userUtils.DEFAULT_USER_TEST.password,
      email: newEmail,
      status: userUtils.DEFAULT_USER_TEST.status,
      roles: ["user"],
    };

    const response = await request(app)
      .put(`/api/v0/users/${currentUser.id}`)
      .send(newUser);

    expect(response.status).toBe(constantsUtils.STATUS_CODE_OK);

    getAllUsersResponse = await request(app).get("/api/v0/users");

    users = getAllUsersResponse.body;
    expect(users.length).toBe(1);

    expect(users[0].userName).toBe(newUser.userName);
    expect(users[0].email).toBe(newUser.email);
  });

  test("Test that user is updated properly and values matches", async () => {
    await userUtils.cleanUserTable();

    const userName = "test";
    const userPassword = "12345";
    const userEmail = "test@gmail.com";
    const userStatus = "active";

    const roleUser = "user";
    const roleAdmin = "admin";
    const userRoles = [roleUser];

    var user = {
      id: null,
      userName: userName,
      password: userPassword,
      email: userEmail,
      status: userStatus,
      roles: userRoles,
    };

    var response = await request(app).post("/api/v0/users/register").send(user);

    var newUser = response.body.user;
    expect(response.status).toBe(constantsUtils.STATUS_CODE_OK);
    expect(newUser).not.toBeNull();
    expect(newUser.userName).toBe(userName);
    expect(newUser.email).toBe(userEmail);
    expect(newUser.status).toBe(userStatus);

    expect(Array.isArray(newUser.roles)).toBeTruthy();
    expect(newUser.roles.length).toBe(userRoles.length);

    user.id = newUser.id;
    user.roles = [roleAdmin];

    response = await request(app).put(`/api/v0/users/${newUser.id}`).send(user);

    expect(response.status).toBe(constantsUtils.STATUS_CODE_OK);

    response = await request(app).get("/api/v0/users");

    newUser = response.body[0];
    expect(newUser).not.toBeNull();
    expect(newUser.userName).toBe(userName);
    expect(newUser.email).toBe(userEmail);
    expect(newUser.status).toBe(userStatus);

    expect(Array.isArray(newUser.roles)).toBeTruthy();
    expect(newUser.roles.length).toBe(1);
    expect(newUser.roles[0]).toBe(roleAdmin);
  });
});

describe("DELETE /api/v0/users/:id", () => {
  test("Test that user is deleted properly", async () => {
    var usersResponse = await request(app).get("/api/v0/users");

    var users = usersResponse.body;
    expect(users.length).toBe(1);

    const response = await request(app).delete(`/api/v0/users/${users[0].id}`);

    expect(response.status).toBe(constantsUtils.STATUS_CODE_OK);

    usersResponse = await request(app).get("/api/v0/users");

    users = usersResponse.body;
    expect(users.length).toBe(0);
  });

  test("Test that user is not deleted when id is invalid", async () => {
    const invalidUserId = 9999999999999;
    var usersResponse = await request(app).get("/api/v0/users");

    var users = usersResponse.body;
    expect(users.length).toBe(1);

    const response = await request(app).delete(
      `/api/v0/users/${invalidUserId}`
    );

    expect(response.status).toBe(constantsUtils.STATUS_CODE_BAD_REQUEST);
    expect(response.body.error).toBe(
      constantsUtils.ERROR_MESSAGE_USER_DOES_NOT_EXISTS_MESSAGE
    );

    usersResponse = await request(app).get("/api/v0/users");

    users = usersResponse.body;
    expect(users.length).toBe(1);
  });
});

describe("POST /api/v0/users/authenticate", () => {
  test("Test authentication succeed", async () => {
    const response = await request(app)
      .post(`/api/v0/users/authenticate`)
      .send({
        email: userUtils.DEFAULT_USER_TEST.email,
        password: userUtils.DEFAULT_USER_TEST.password,
      });

    const { user, token } = response.body;

    expect(response.status).toBe(constantsUtils.STATUS_CODE_OK);
    expect(token).not.toBeNull();
    expect(token.length).not.toBe(0);
    expect(user).not.toBeNull();

    expect(user.email).toBe(currentUser.email);
    expect(user.userName).toBe(currentUser.userName);
  });

  test("Test authentication fails when user does not exists", async () => {
    const response = await request(app)
      .post(`/api/v0/users/authenticate`)
      .send({
        email: "invalidUserEmail@gmail.com",
        password: userUtils.DEFAULT_USER_TEST.password,
      });

    expect(response.status).toBe(constantsUtils.STATUS_CODE_BAD_REQUEST);
    expect(response.body.error).toBe(
      constantsUtils.ERROR_MESSAGE_USER_DOES_NOT_EXISTS_MESSAGE
    );
  });

  test("Test authentication fails when password does not match", async () => {
    const response = await request(app)
      .post(`/api/v0/users/authenticate`)
      .send({
        email: userUtils.DEFAULT_USER_TEST.email,
        password: "InvalidPassword",
      });

    expect(response.status).toBe(constantsUtils.STATUS_CODE_BAD_REQUEST);
    expect(response.body.error).toBe(
      constantsUtils.ERROR_MESSAGE_AUTHENTICATION_FAILED
    );
  });
});

describe("GET /api/v0/users/forgotPassword/:userNameOrEmail", () => {
  test("Test to resend reset password does not succed", async () => {
    const forgotPasswordResponse = await request(app).get(
      "/api/v0/users/forgotPassword/invalidEmail@gmail.com"
    );

    expect(forgotPasswordResponse.status).toBe(
      constantsUtils.STATUS_CODE_BAD_REQUEST
    );
    expect(forgotPasswordResponse.body.error).toBe(
      constantsUtils.ERROR_MESSAGE_USER_DOES_NOT_EXISTS_MESSAGE
    );
  });

  test("Test to resend reset password succeed", async () => {
    const forgotPasswordResponse = await request(app).get(
      "/api/v0/users/forgotPassword/" + userUtils.DEFAULT_USER_TEST.email
    );

    const passwordResetToken = forgotPasswordResponse.body.passwordResetToken;
    expect(forgotPasswordResponse.status).toBe(constantsUtils.STATUS_CODE_OK);
    expect(passwordResetToken).not.toBeNull();
    expect(passwordResetToken.length).not.toBe(0);
  });

  test("Test to resend reset password succeed and data macthes", async () => {
    const userResponse = await request(app).get(
      `/api/v0/users/${currentUser.email}`
    );

    var user = userResponse.body;
    expect(user.passwordResetToken).toBe(undefined);
    expect(user.passwordResetExpires).toBe(undefined);

    const forgotPasswordResponse = await request(app).get(
      "/api/v0/users/forgotPassword/" + userUtils.DEFAULT_USER_TEST.email
    );

    expect(forgotPasswordResponse.status).toBe(constantsUtils.STATUS_CODE_OK);

    user = forgotPasswordResponse.body;

    expect(user.passwordResetToken).not.toBeNull();
    expect(user.passwordResetToken.length).not.toBe(0);
    expect(user.passwordResetExpires).toBe(undefined);
  });
});

describe("POST /api/v0/users/resetPassword", () => {
  test("Test that password was resetted successfully", async () => {
    const forgotPasswordResponse = await request(app).get(
      "/api/v0/users/forgotPassword/" + userUtils.DEFAULT_USER_TEST.email
    );

    const passwordResetToken = forgotPasswordResponse.body.passwordResetToken;
    const response = await request(app)
      .post("/api/v0/users/resetPassword")
      .send({
        email: userUtils.DEFAULT_USER_TEST.email,
        token: passwordResetToken,
        password: "NewPassword",
      });

    expect(response.status).toBe(constantsUtils.STATUS_CODE_OK);
  });

  test("Test that password was not resetted since password token was not provided", async () => {
    const response = await request(app)
      .post("/api/v0/users/resetPassword")
      .send({
        email: userUtils.DEFAULT_USER_TEST.email,
        password: "NewPassword",
      });

    expect(response.status).toBe(constantsUtils.STATUS_CODE_BAD_REQUEST);
    expect(response.body.error).toBe(
      constantsUtils.ERROR_MESSAGE_INVALID_TOKEN_RESET_PASSWORD
    );
  });

  test("Test that password was not resetted since user is invalid", async () => {
    const forgotPasswordResponse = await request(app).get(
      "/api/v0/users/forgotPassword/" + userUtils.DEFAULT_USER_TEST.email
    );

    const passwordResetToken = forgotPasswordResponse.body.passwordResetToken;
    const response = await request(app)
      .post("/api/v0/users/resetPassword")
      .send({
        email: "invalidUserEmail@gmail.com",
        token: passwordResetToken,
        password: "NewPassword",
      });

    expect(response.status).toBe(constantsUtils.STATUS_CODE_BAD_REQUEST);
    expect(response.body.error).toBe(
      constantsUtils.ERROR_MESSAGE_USER_DOES_NOT_EXISTS_MESSAGE
    );
  });

  test("Test that password was not resetted since password token is null but token expires", async () => {
    currentUser.passwordResetExpires = new Date();
    currentUser.passwordResetToken = null;
    currentUser.roles = "user";
    await userUtils.update(currentUser);

    const tmpToken = crypto.randomBytes(6).toString("hex");
    const response = await request(app)
      .post("/api/v0/users/resetPassword")
      .send({
        email: userUtils.DEFAULT_USER_TEST.email,
        token: tmpToken,
        password: "NewPassword",
      });

    expect(response.status).toBe(constantsUtils.STATUS_CODE_BAD_REQUEST);
    expect(response.body.error).toBe(
      constantsUtils.ERROR_MESSAGE_INVALID_TOKEN_RESET_PASSWORD
    );
  });

  test("Test that password was not resetted since password token expires is null but password token", async () => {
    const tmpToken = crypto
      .randomBytes(constantsUtils.TMP_PASSWD_HASH_SIZE)
      .toString("hex");

    currentUser.passwordResetExpires = null;
    currentUser.passwordResetToken = tmpToken;
    currentUser.roles = "user";
    await userUtils.update(currentUser);

    const response = await request(app)
      .post("/api/v0/users/resetPassword")
      .send({
        email: userUtils.DEFAULT_USER_TEST.email,
        token: tmpToken,
        password: "NewPassword",
      });

    expect(response.status).toBe(constantsUtils.STATUS_CODE_BAD_REQUEST);
    expect(response.body.error).toBe(
      constantsUtils.ERROR_MESSAGE_INVALID_TOKEN_RESET_PASSWORD
    );
  });

  test("Test that password token provided is different from user password token", async () => {
    await request(app).get(
      "/api/v0/users/forgotPassword/" + userUtils.DEFAULT_USER_TEST.email
    );

    const tmpToken = crypto
      .randomBytes(constantsUtils.TMP_PASSWD_HASH_SIZE)
      .toString("hex");
    const response = await request(app)
      .post("/api/v0/users/resetPassword")
      .send({
        email: userUtils.DEFAULT_USER_TEST.email,
        token: tmpToken,
        password: "NewPassword",
      });

    expect(response.status).toBe(constantsUtils.STATUS_CODE_BAD_REQUEST);
    expect(response.body.error).toBe(
      constantsUtils.ERROR_MESSAGE_INVALID_TOKEN
    );
  });

  test("Test that password token are equal but it has expired", async () => {
    const forgotPasswordResponse = await request(app).get(
      "/api/v0/users/forgotPassword/" + userUtils.DEFAULT_USER_TEST.email
    );

    const passwordResetToken = forgotPasswordResponse.body.passwordResetToken;

    const tokenExpirationDate = new Date();
    tokenExpirationDate.setHours(tokenExpirationDate.getHours() - 5);
    currentUser.passwordResetExpires = tokenExpirationDate;
    currentUser.roles = "user";

    await userUtils.update(currentUser);
    const response = await request(app)
      .post("/api/v0/users/resetPassword")
      .send({
        email: userUtils.DEFAULT_USER_TEST.email,
        token: passwordResetToken,
        password: "NewPassword",
      });

    expect(response.status).toBe(constantsUtils.STATUS_CODE_BAD_REQUEST);
    expect(response.body.error).toBe(
      constantsUtils.ERROR_MESSAGE_RESET_PASSWORD_TOKEN_EXPIRED
    );
  });
});

describe("isInvalidArray", () => {
  test("Test that true is returned when null is sent", async () => {
    const result = userController.isInvalidArray(null);
    expect(result).toBeTruthy();
  });

  test("Test that true is returned when string is passed intead array", async () => {
    const result = userController.isInvalidArray("user");
    expect(result).toBeTruthy();
  });

  test("Test that null is returned when array only contains one null value and nothing else", async () => {
    const array = [];
    array.push(null);

    const result = userController.isInvalidArray("user");
    expect(result).toBeTruthy();
  });

  test("Test that true is returned when array only contains one undefined value and nothing else", async () => {
    const array = [];
    array.push(undefined);

    const result = userController.isInvalidArray("user");
    expect(result).toBeTruthy();
  });

  test("Test that null is returned when array only contains multiple null values and nothing else", async () => {
    const array = [];
    array.push(null);
    array.push(null);
    array.push(null);

    const result = userController.isInvalidArray("user");
    expect(result).toBeTruthy();
  });

  test("Test that true is returned when array only contains multiple undefined values and nothing else", async () => {
    const array = [];
    array.push(undefined);
    array.push(undefined);

    const result = userController.isInvalidArray("user");
    expect(result).toBeTruthy();
  });

  test("Test that false is returned when array contains user roles and one undefined value", async () => {
    const array = [];
    array.push(undefined);
    array.push("user");

    const result = userController.isInvalidArray("user");
    expect(result).toBeTruthy();
  });

  test("Test that false is returned when array contains user roles and one undefined value in different order", async () => {
    const array = [];
    array.push("user");
    array.push(undefined);

    const result = userController.isInvalidArray("user");
    expect(result).toBeTruthy();
  });

  test("Test that false is returned when array contains user roles and one null value in different order", async () => {
    const array = [];
    array.push(null);
    array.push("user");

    const result = userController.isInvalidArray("user");
    expect(result).toBeTruthy();
  });

  test("Test that false is returned when array contains user roles and one null value in different order", async () => {
    const array = [];
    array.push("user");
    array.push(null);

    const result = userController.isInvalidArray("user");
    expect(result).toBeTruthy();
  });

  test("Test that false is returned when array contains user roles and mulyiple null and undefined values", async () => {
    const array = [];
    array.push("user");
    array.push(undefined);
    array.push("admin");
    array.push(null);
    array.push("none");
    array.push(undefined);
    array.push("superAdmin");
    array.push(null);

    const result = userController.isInvalidArray("user");
    expect(result).toBeTruthy();
  });
});

describe("convertArrayIntoString", () => {
  test("Test that array is converted properly", async () => {
    const userRole = "user";
    const adminRole = "admin";
    const roles = [userRole, adminRole];
    const convertedRoles = userController.convertArrayIntoString(roles);

    expect(convertedRoles).toBe(userRole + ";" + adminRole);
  });

  test("Test that array is converted properly when it is combined with null and undefined values", async () => {
    const userRole = "user";
    const adminRole = "admin";
    const roles = [userRole, null, undefined, adminRole, null];
    const convertedRoles = userController.convertArrayIntoString(roles);

    expect(convertedRoles).toBe(userRole + ";" + adminRole);
  });

  test("Test that array returns empty when null is sent", async () => {
    const convertedRoles = userController.convertArrayIntoString(null);
    expect(convertedRoles).toBe("");
  });

  test("Test that array returns empty when undefined is sent", async () => {
    const convertedRoles = userController.convertArrayIntoString(undefined);
    expect(convertedRoles).toBe("");
  });

  test("Test that array returns empty when empty array is sent", async () => {
    const convertedRoles = userController.convertArrayIntoString([]);
    expect(convertedRoles).toBe("");
  });
});

describe('GET HealthCheck', () => {

	test('Returns 200 if server is healthy', async () => {
		const response = await request(app).get(`/api/v0/users/healthcheck`);
		expect(response.status).toBe(constantsUtils.STATUS_CODE_OK);
		expect(response.body.uptime).toBeGreaterThan(0);
	});
});