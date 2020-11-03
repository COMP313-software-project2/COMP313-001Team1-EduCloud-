//1. getAll by user
//2. eventById 
//3. create
//4. update
//5. read for passing the event from eventById
import _ from 'lodash'
import {ObjectID} from 'mongodb'
import {OrderedMap} from 'immutable'

export default class Event {
    constructor(app) {
        this.app = app;
        this.events = new OrderedMap();
    }

    getAll(userId, offset = 0) {
        return new Promise((resolve, reject) => {
            userId = new ObjectID(userId);
            console.log("userId in getAll : " + userId)
            
              const query = [
                {
                    $match: {
                        'userId' : {$eq: userId}
                    }
                },
                {
                    $project: {
                        _id: true,
                        userId: true,
                        title: true,
                        start: true,
                        end: true,
                        info : true
                    }
                },
                {
                    $skip: offset
                }
            ];
            this.app.db.collection('events').aggregate(query,(err, results) => {
                return err ? reject(err): resolve(results)
            }); 
        })
    }

    update(event,eventId) {
        console.log("inside event update, event : " + eventId);
        console.log("inside update, event :  " + event.title)
        return new Promise((resolve, reject) => {
        this.app.db.collection('events').findOneAndUpdate({_id:eventId}, 
            {$set:{
                title: event.title,
                start: event.start,
                end: event.end,
                info: event.info
            }}
        , (err, res) => {
            if(err) {
                console.log("error occured during updating event");
                return reject(err);
             }
             return resolve(res);
            
        })
    })
        
    }

    findEventById(id, callback = () => {}) {
        if(!id) {
            console.log("id is null")
        }
        const eventId = new ObjectID(id);
        this.app.db.collection('events').findOne({_id:eventId}, (err, result) => {
            if(err || !result) {
                console.log("no event corresponding to " + eventId)
            }
            return callback(null, result);
        })
    }

    load(id) {
        //id = `${id}`;
        id = _.toString(id);
        return new Promise((resolve, reject) => {
            this.findEventById(id, (err,event) => {
                if(!err && event) {
                    this.events = this.events.set(id, event);
                }
                return err ? reject(err) : resolve(event)
            })
        })
    }

    create(obj) {
        return new Promise((resolve,reject) => {
            console.log("from event models, obj _id value : " + obj._id + " title value : " + obj.title)
            const userId = new ObjectID(_.get(obj,'userId'));
            console.log("userId : " + userId);
            const event = {
                //_id: new ObjectID(id),
                title: obj.title,
                start: obj.start,
                end: obj.end,
                info : obj.info,
                userId: userId       
            };
            this.app.db.collection('events').insertOne(event,(err) => {
                if(err) {
                    console.log("err in db.collection : " + err)
                    return reject(err);
                }
               return resolve(event);
            })
        })
    }
}
