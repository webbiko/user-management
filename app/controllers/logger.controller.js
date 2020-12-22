const monitoringEnvironment = "production";
exports.init = () => {
    if (process.env.NODE_ENV === monitoringEnvironment) {
        require("newrelic");
    }
};

exports.log = (name, message, stackTrace = undefined) => {
    if (process.env.NODE_ENV === monitoringEnvironment) {
        const newrelic = require("newrelic");

        newrelic.addCustomAttribute(name, message);
        newrelic.noticeError(Error(name, message, stackTrace));
    } else {
        console.log(`[ERROR]: name => ${name}, message => ${message}, stackTrace => ${stackTrace}`);
    }
};