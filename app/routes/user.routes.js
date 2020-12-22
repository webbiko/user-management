module.exports = (app, axios) => {
  const userController = require("../controllers/user.controller");

  const apiAccessLimit = require("../middleware/authentication-rate-limit")
    .authenticationApiLimiter;

  const router = require("express").Router();

  router.get("/healthcheck", userController.healthCheck);

  router.get("/", userController.findAll);

  router.post("/register", apiAccessLimit, (req, res) => {
    userController.create(axios, req, res);
  });

  router.post("/authenticate", (req, res) => {
    userController.authenticate(axios, req, res);
  });

  router.get("/:userNameOrEmail", userController.findOne);

  router.get(
    "/forgotPassword/:userNameOrEmail",
    apiAccessLimit,
    userController.forgotPassword
  );

  router.post("/resetPassword", apiAccessLimit, userController.resetPassword);

  router.put("/:id", userController.update);

  router.delete("/:id", userController.delete);

  app.use("/api/v0/users", router);
};