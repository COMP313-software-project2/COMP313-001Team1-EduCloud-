import User from './user'
import Token from './token'
import Connection from './connection'
import Channel from './channel';
import Message from "./message";
import Event from "./event";


export default class Model{

    constructor(app){

        this.app = app;

        this.user = new User(app);
        this.token = new Token(app);
        this.channel = new Channel(app);
        this.message = new Message(app);
        this.event = new Event(app);
        this.connection = new Connection(app);
    }
}