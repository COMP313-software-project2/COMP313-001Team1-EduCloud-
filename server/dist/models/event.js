'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); //1. getAll by user
//2. eventById 
//3. create
//4. update
//5. read for passing the event from eventById


var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _mongodb = require('mongodb');

var _immutable = require('immutable');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Event = function () {
    function Event(app) {
        _classCallCheck(this, Event);

        this.app = app;
        this.events = new _immutable.OrderedMap();
    }

    _createClass(Event, [{
        key: 'getAll',
        value: function getAll(userId) {
            var _this = this;

            var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

            return new Promise(function (resolve, reject) {
                userId = new _mongodb.ObjectID(userId);
                console.log("userId in getAll : " + userId);

                var query = [{
                    $match: {
                        'userId': { $eq: userId }
                    }
                }, {
                    $project: {
                        _id: true,
                        userId: true,
                        title: true,
                        start: true,
                        end: true,
                        info: true
                    }
                }, {
                    $skip: offset
                }];
                _this.app.db.collection('events').aggregate(query, function (err, results) {
                    return err ? reject(err) : resolve(results);
                });
            });
        }
    }, {
        key: 'update',
        value: function update(event, eventId) {
            var _this2 = this;

            console.log("inside event update, event : " + eventId);
            console.log("inside update, event :  " + event.title);
            return new Promise(function (resolve, reject) {
                _this2.app.db.collection('events').findOneAndUpdate({ _id: eventId }, { $set: {
                        title: event.title,
                        start: event.start,
                        end: event.end,
                        info: event.info
                    } }, function (err, res) {
                    if (err) {
                        console.log("error occured during updating event");
                        return reject(err);
                    }
                    return resolve(res);
                });
            });
        }
    }, {
        key: 'findEventById',
        value: function findEventById(id) {
            var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

            if (!id) {
                console.log("id is null");
            }
            var eventId = new _mongodb.ObjectID(id);
            this.app.db.collection('events').findOne({ _id: eventId }, function (err, result) {
                if (err || !result) {
                    console.log("no event corresponding to " + eventId);
                }
                return callback(null, result);
            });
        }
    }, {
        key: 'load',
        value: function load(id) {
            var _this3 = this;

            //id = `${id}`;
            id = _lodash2.default.toString(id);
            return new Promise(function (resolve, reject) {
                _this3.findEventById(id, function (err, event) {
                    if (!err && event) {
                        _this3.events = _this3.events.set(id, event);
                    }
                    return err ? reject(err) : resolve(event);
                });
            });
        }
    }, {
        key: 'create',
        value: function create(obj) {
            var _this4 = this;

            return new Promise(function (resolve, reject) {
                console.log("from event models, obj _id value : " + obj._id + " title value : " + obj.title);
                var userId = new _mongodb.ObjectID(_lodash2.default.get(obj, 'userId'));
                console.log("userId : " + userId);
                var event = {
                    //_id: new ObjectID(id),
                    title: obj.title,
                    start: obj.start,
                    end: obj.end,
                    info: obj.info,
                    userId: userId
                };
                _this4.app.db.collection('events').insertOne(event, function (err) {
                    if (err) {
                        console.log("err in db.collection : " + err);
                        return reject(err);
                    }
                    return resolve(event);
                });
            });
        }
    }]);

    return Event;
}();

exports.default = Event;
//# sourceMappingURL=event.js.map