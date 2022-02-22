// ******************** //
// Reusable functions to avoid repetition.
// ******************** //

const variables = require('../other/variables');
const { v4 } = require('uuid');

// TODO: Move many of these to their respective files, only have a use there.

function insertLog(mdb, logText) {
    const logDict = {timestamp: new Date(), info: logText};

    mdb.collection('logs').insertOne(logDict).catch(() => {});
}

function insertTextToCollection(mdb, collName, text) {
    const dictToInsert = {timestamp: new Date()};
    dictToInsert[v4()] = text;

    mdb.collection(collName).insertOne(dictToInsert).catch(() => {});
}

async function listDocuments(mdb, collName) {
    return await mdb.collection(collName).find({}).toArray();
}

module.exports = {
    convertToId: (username) => {
        // 'Fronvo user 1' => 'fronvouser1'
        return username.replace(/ /g, '').toLowerCase();
    },

    insertLog: insertLog,

    loginSocket: (io, socket, accountId) => {
        variables.loggedInSockets[socket.id] = accountId;

        // Update other servers in cluster mode
        if(variables.cluster) io.serverSideEmit('loginSocket', socket.id, accountId);
    },

    logoutSocket: (io, socket) => {
        delete variables.loggedInSockets[socket.id];
        
        if(variables.cluster) io.serverSideEmit('logoutSocket', socket.id);
    },

    createToken: async (mdb, accountId) => {
        const tokenDict = {};
        const token = v4();
        
        tokenDict[accountId] = token;
    
        await mdb.collection('tokens').insertOne(tokenDict);
    
        return token;
    },

    getToken: async (mdb, accountId) => {
        const tokens = await listDocuments(mdb, 'tokens');

        for(let token in tokens) {
            token = tokens[token];
            const tokenAccountId = Object.keys(token)[1];

            if(accountId === tokenAccountId) {
                return token[tokenAccountId];
            }
        }
    },
    
    // TODO: Remove
    isSocketLoggedIn: (socket) => {
        return socket.id in variables.loggedInSockets;
    },

    // TODO: Remove this nightmare of a function aswell
    getLoggedInSockets: () => {
        return variables.loggedInSockets;
    },

    listDocuments: listDocuments,

    perfStart: (perfName) => {
        if(!variables.performanceReportsEnabled) return;

        // Mantain uniqueness regardless of perfName
        const perfUUID = v4();

        variables.performanceReports[perfUUID] = {
            perfName: perfName,
            timestamp: new Date()
        };

        // Return it for perfEnd
        return perfUUID;
    },

    perfEnd: (mdb, perfUUID) => {
        if(!variables.performanceReportsEnabled || !perfUUID in variables.performanceReports) return;

        // Basically copy the dictionary
        const perfReportDict = variables.performanceReports[perfUUID];

        const msDuration = new Date() - perfReportDict.timestamp;

        // Check if it passes the min report MS duration (optional)
        if(msDuration >= variables.performanceReportsMinMS) {
            insertTextToCollection(mdb, 'reports', perfReportDict.perfName + ' took ' + msDuration + 'ms.');
        }

        // Delete to save memory
        delete variables.performanceReports[perfUUID];
    },
    
    getEmailDomain: (email) => {
        // Will fail Joi schema checks if the email doesnt comply with this format
        return email.split('@')[1];
    }
}
