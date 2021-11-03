// An optional client for the server of Fronvo, use for testing purposes
// Shadofer#6681

const PORT = process.env.PORT || 3001;

// in ms
const RECONNECT_DELAY = 1000;
const RECONNECT_DELAY_MAX = 5000;

const io = require('socket.io-client');
const socket = io('ws://localhost:' + PORT, {
    // limit to websocket connections, no http polling due to pm2
    transports: ['websocket'],
    path: '/fronvo',
    reconnectionDelay: RECONNECT_DELAY,
    reconnectionDelayMax: RECONNECT_DELAY_MAX
});

console.log('Client connecting to port ' + PORT + '...');

socket.on('connect', () => {
    // prevent sending offline packets not to overflow the server
    socket.sendBuffer = [];

    console.log('Client connected.');

    let email = 'somerandomemail@gmail.com';
    let password = 'changethisplease123';

    socket.emit('register', {
        email: email,
        password: password
    }, (err, token) => {
        if(err) {
            socket.emit('login', {
                email: email,
                password: password
            }, (err, token) => {
                if(err) console.log(err);
                else {
                    console.log('Successfully logged in, token: ', token);
                }
            });
         } else {
            console.log('Successfully registered, token: ', token);
         }
    });
});

socket.on('disconnect', () => {
    console.log('Client disconnected.');
});

socket.on('connect_error', () => {
    console.log('Connection failed, retrying...');
});

socket.on('message', (data) => {
    console.log('message: ' + data);
});
