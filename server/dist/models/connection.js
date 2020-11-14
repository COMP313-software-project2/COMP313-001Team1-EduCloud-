'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _immutable = require('immutable');

var _mongodb = require('mongodb');

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Connection = function () {
    function Connection(app) {
        _classCallCheck(this, Connection);

        this.app = app;

        this.connections = (0, _immutable.OrderedMap)();

        this.modelDidLoad();
    }

    // find(query = {}, options = {}) {
    //     return new Promise((resolve, reject) =>{
    //         this.app.db.collection('user').find(query, options).toArray((err, users) => {
    //             return err ? reject(err) : resolve(users);
    //         })
    //     })
    // }

    _createClass(Connection, [{
        key: 'decodeMesasge',
        value: function decodeMesasge(msg) {

            var messageObject = null;

            try {

                messageObject = JSON.parse(msg);
            } catch (err) {

                console.log("An error decode the socket mesage", msg);
            }

            return messageObject;
        }
    }, {
        key: 'sendToMembers',
        value: function sendToMembers(userId, obj) {
            var _this = this;

            var query = [{
                $match: {

                    members: { $all: [new _mongodb.ObjectID(userId)] }
                }
            }, {

                $lookup: {

                    from: 'users',
                    localField: 'members',
                    foreignField: '_id',
                    as: 'users'
                }
            }, {
                $unwind: {

                    path: '$users'
                }
            }, {
                $match: { 'users.online': { $eq: true } }
            }, {
                $group: {

                    _id: "$users._id"
                }
            }];

            var users = [];

            this.app.db.collection('channels').aggregate(query, function (err, results) {

                console.log("found members array who is chattting with current user", results);
                if (err === null && results) {

                    _lodash2.default.each(results, function (result) {

                        var uid = _lodash2.default.toString(_lodash2.default.get(result, '_id'));
                        if (uid) {
                            users.push(uid);
                        }
                    });

                    // this is list of all connections is chatting with current user
                    var memberConnections = _this.connections.filter(function (con) {
                        return _lodash2.default.includes(users, _lodash2.default.toString(_lodash2.default.get(con, 'userId')));
                    });
                    if (memberConnections.size) {

                        memberConnections.forEach(function (connection, key) {

                            var ws = connection.ws;
                            _this.send(ws, obj);
                        });
                    }
                }
            });
        }
    }, {
        key: 'sendAll',
        value: function sendAll(obj) {
            var _this2 = this;

            // send socket messages to all clients.

            this.connections.forEach(function (con, key) {
                var ws = con.ws;

                _this2.send(ws, obj);
            });
        }
    }, {
        key: 'send',
        value: function send(ws, obj) {

            var message = JSON.stringify(obj);

            ws.send(message);
        }
    }, {
        key: 'doTheJob',
        value: function doTheJob(socketId, msg) {
            var _this3 = this;

            var action = _lodash2.default.get(msg, 'action');
            var payload = _lodash2.default.get(msg, 'payload');
            var userConnection = this.connections.get(socketId);

            switch (action) {

                case 'create_message':
                    if (userConnection.isAuthenticated) {
                        var messageObject = payload;

                        messageObject.userId = _lodash2.default.get(userConnection, 'userId');

                        //console.log("Got message from client about creating new message", payload);

                        this.app.models.message.create(messageObject).then(function (message) {

                            console.log("Message created", message);

                            var channelId = _lodash2.default.toString(_lodash2.default.get(message, 'channelId'));

                            _this3.app.models.channel.load(channelId).then(function (channel) {

                                console.log("got channel of the message created", channel);

                                var memberIds = _lodash2.default.get(channel, 'members', []);

                                _lodash2.default.each(memberIds, function (memberId) {

                                    memberId = _lodash2.default.toString(memberId);

                                    var memberConnections = _this3.connections.filter(function (c) {
                                        return _lodash2.default.toString(c.userId) === memberId;
                                    });

                                    memberConnections.forEach(function (connection) {

                                        var ws = connection.ws;

                                        _this3.send(ws, {

                                            action: 'message_added',
                                            payload: message
                                        });
                                    });
                                });
                            });

                            // message created successful.

                        }).catch(function (err) {
                            // send back to the socket client who sent this messagse with error
                            var ws = userConnection.ws;
                            _this3.send(ws, {
                                action: 'create_message_error',
                                payload: payload
                            });
                        });
                    }

                    break;
                case 'create_channel':
                    var channel = payload;

                    var userId = userConnection.userId;
                    channel.userId = userId;

                    this.app.models.channel.create(channel).then(function (channelObject) {

                        // successful created channel ,

                        //console.log("Succesful created new channel", typeof userId, chanelObject);

                        // let send back to all members in this channel  with new channel  created
                        var memberConnections = [];

                        var memberIds = _lodash2.default.get(channelObject, 'members', []);

                        // fetch all users has memberId


                        var query = {
                            _id: { $in: memberIds }
                        };

                        var queryOptions = {
                            _id: 1,
                            name: 1,
                            created: 1
                        };

                        _this3.app.models.user.find(query, queryOptions).then(function (users) {
                            channelObject.users = users;

                            _lodash2.default.each(memberIds, function (id) {

                                var userId = id.toString();
                                var memberConnection = _this3.connections.filter(function (con) {
                                    return '' + con.userId === userId;
                                });

                                if (memberConnection.size) {
                                    memberConnection.forEach(function (con) {

                                        var ws = con.ws;
                                        var obj = {
                                            action: 'channel_added',
                                            payload: chanelObject

                                            //send to socket client matching userId in channel members
                                        };_this3.send(ws, obj);
                                    });
                                }
                            });
                        });

                        //const memberConnections = this.connections.filter((con) => `${con.userId}` = )
                    });
                    console.log("Got new channel need to be created from client", channel);

                    break;
                case 'auth':

                    var userTokenId = payload;
                    var connection = this.connections.get(socketId);

                    if (connection) {

                        // let find user with this token and verify it.
                        this.app.models.token.loadTokenAndUser(userTokenId).then(function (token) {

                            var userId = token.userId;

                            connection.isAuthenticated = true;
                            connection.userId = '' + userId;

                            _this3.connections = _this3.connections.set(socketId, connection);

                            // now send back to the client you are verified.
                            var obj = {
                                action: 'auth_success',
                                payload: 'You are verified'
                            };
                            _this3.send(connection.ws, obj);

                            //send to all socket clients connection

                            var userIdString = _lodash2.default.toString(userId);
                            _this3.sendToMembers(userIdString, {
                                action: 'user_online',
                                payload: userIdString
                            });

                            _this3.app.models.user.updateUserStatus(userIdString, true);
                        }).catch(function (err) {

                            // send back to socket client you are not logged.
                            var obj = {
                                action: 'auth_error',
                                payload: "An error authentication your account: " + userTokenId
                            };

                            _this3.send(connection.ws, obj);
                        });
                    }

                    console.log("User with token Id is: ", userTokenId, typeof userTokenId === 'undefined' ? 'undefined' : _typeof(userTokenId));

                    break;

                default:

                    break;
            }
        }
    }, {
        key: 'modelDidLoad',
        value: function modelDidLoad() {
            var _this4 = this;

            this.app.wss.on("connection", function (ws) {

                var socketId = new _mongodb.ObjectID().toString();

                //console.log("Someone connected to the server via socket", socketId);


                var clientConnection = {
                    _id: '' + socketId,
                    ws: ws,
                    userId: null,
                    isAuthenticated: false

                    // save this connection client to cache.
                };_this4.connections = _this4.connections.set(socketId, clientConnection);

                // listen any message from websocket client.

                ws.on('message', function (msg) {

                    //console.log("SERVER: message from a client", msg);

                    var message = _this4.decodeMesasge(msg);
                    _this4.doTheJob(socketId, message);

                    console.log("SERVER: message from a client", msg);
                });

                ws.on("close", function () {
                    //console.log("Someone disconnected to the server", socketId);
                    var closeConnection = _this4.connections.get(socketId);
                    var userId = _lodash2.default.toString(_lodash2.default.get(closeConnection, 'userId', null));

                    // let remove this socket client from the cache collection.
                    _this4.connections = _this4.connections.remove(socketId);

                    if (userId) {
                        // now find all socket clients matching with userId

                        var userConnections = _this4.connections.filter(function (con) {
                            return _lodash2.default.toString(_lodash2.default.get(con, 'userId')) === userId;
                        });

                        if (userConnections.size === 0) {

                            // this mean no more socket clients is online with this userId. now user is offline.
                            _this4.sendToMembers(userId, {
                                action: 'user_offline',
                                payload: userId
                            });

                            // update user status into database

                            _this4.app.models.user.updateUserStatus(userId, false);
                        }
                    }
                });
            });
        }
    }]);

    return Connection;
}();

exports.default = Connection;
//# sourceMappingURL=connection.js.map