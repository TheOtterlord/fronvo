const errors = require('../other/errors');
const { enums } = require('../other/enums');

module.exports = {
    // Connected accounts for each socket (socketId: accountId)
    loggedInSockets: {},
    
    defaultError: {msg: errors.ERR_UNKNOWN, code: enums.ERR_UNKNOWN},

    // passwords
    mainBcryptHash: 12,

    // logging of performance for every function
    performanceReportsEnabled: Boolean(process.env.FRONVO_PERFORMANCE_REPORTS) || false,

    // storage of temporary performance reports
    performanceReports: {},

    cluster: process.env.TARGET_PM2 == 'true' || false
}
