const config = require('./config/config.json');

module.exports.isDev = function(user) {
    return (config.developers.indexOf(user.id) !== -1);
};

module.exports.isIdDev = function(user) {
    return (config.developers.indexOf(user) !== -1); // -1 means there is nothing found
};