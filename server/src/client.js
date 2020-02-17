const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3000/');

ws.on ('open', () => {

console.log("Successful conntected to the server");

//send new message from this client to server

ws.send("Hello server my name is client");

//listen any message from the server.
// ws.on('message', (message) => {

//     // console.log("Got back message from the server with message is: ", message);
//     console.log("Server says: ", message);
//     ws.send(message);


// });



});

