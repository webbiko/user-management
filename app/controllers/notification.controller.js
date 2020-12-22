const notificationRepository = require("../repository/notification.repository");

exports.sendNotification = async (email, token) => {
  if (process.env.SEND_EMAIL === true) {
    const subject = "Change password";
    const message =
      "Hey, you forgot your password and we are here to help you. Please, use this password to change it: " +
      token;
    notificationRepository.sendEmail(email, subject, message);
  }
};