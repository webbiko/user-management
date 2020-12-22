const rateLimit = require("express-rate-limit");

const authenticationApiLimiter = exports.authenticationApiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: process.env.API_RATE_LIMIT
});

exports.authenticationApiLimiter = authenticationApiLimiter;