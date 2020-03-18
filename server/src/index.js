import http from 'http';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import {version} from '../package.json'
import WebSocketServer, {Server} from 'ws';
import AppRouter from './app-router';
import Model from './models';
import Database from './database';
import path from 'path'


const PORT = 3001;
const app = express();
app.server = http.createServer(app);


//app.use(morgan('dev'));


app.use(cors({
    exposedHeaders: "*"
}));

app.use(bodyParser.json({
    limit: '50mb'
}));

app.wss = new Server({
    server: app.server
 });

 // static www files use express
const wwwPath = path.join(__dirname, 'www');

app.use('/', express.static(wwwPath));

//Connect to Mongo Database
new Database().connect().then((db) => {

    console.log("Successfully connected to database");

    app.db = db

}).catch((err) => {


    throw(err);
});



//End connect to MongoDB
app.models = new Model(app);
app.routers = new AppRouter(app);



/*
let clients = [];


app.wss.on('connection', (connection) =>{

    const userId = clients.length + 1;
    connection.userId = userId;

    const newClient = {
        ws: connection,
        userId:userId,
    };

    clients.push(newClient);

    console.log("New client connected with userId: ", userId);

    connection.on('message', (message) => {
        console.log("message from", message);
    })
 

    connection.on('close', () => {
        console.log ("Client with ID ", userId, " is disconnected");
        clients = clients.filter((client) => client.userId !== userId);
    });

});*/
/*
app.get('/',(req, res) => {
    res.json({
        version: 1.0
    });
});

app.get('/api/all_connections', (req, res, next) => {
    return res.json({
        people: clients,
    });
});

setInterval(() => {

    //each 3 seconds this function will be executed
    console.log(`There ${clients.length} people in the connection.`);
    
    if(clients.length > 0){
        clients.forEach((client) => {
            // console.log("client Id: ", client.userId);
            const msg = `Hey ID: ${client.userId}: you got a new message from server`;
            client.ws.send(msg);
    });
}
 
}, 3001)

*/
app.server.listen(process.env.PORT || PORT, () => {
        console.log(`App is running on port ${app.server.address().port}`);
});

export default app;