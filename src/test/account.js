// ******************** //
// The account-only function tests for the Fronvo server.
// ******************** //

// Put all of the event test files here
const fetchProfileId = require('./account/fetchProfileId/fetchProfileId');
const fetchProfileData = require('./account/fetchProfileData/fetchProfileData');
const logout = require('./account/logout/logout');

module.exports = { fetchProfileId, fetchProfileData, logout }

