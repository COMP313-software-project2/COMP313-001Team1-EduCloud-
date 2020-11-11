'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _immutable = require('immutable');

var _mongodb = require('mongodb');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Message = function () {
    function Message(app) {
        _classCallCheck(this, Message);

        this.app = app;
        this.messages = new _immutable.OrderedMap();
    }

    _createClass(Message, [{
        key: 'getChannelMessages',
        value: function getChannelMessages(channelId) {
            var _this = this;

            var limit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 50;
            var offset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

            return new Promise(function (resolve, reject) {
                channelId = new _mongodb.ObjectID(channelId);
                var query = [{
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'user'
                    }
                }, {
                    $match: {
                        'channelId': { $eq: channelId }
                    }
                }, {
                    $project: {
                        _id: true,
                        channelId: true,
                        user: { $arrayElemAt: ['$user', 0] },
                        userId: true,
                        body: true,
                        created: true
                    }
                }, {
                    $project: {
                        _id: true,
                        channelId: true,
                        user: { _id: true, role: true, name: true, created: true, online: true },
                        userId: true,
                        body: true,
                        created: true
                    }
                }, {
                    $limit: limit
                }, {
                    $skip: offset
                }, {
                    $sort: { created: -1 }
                }];
                _this.app.db.collection('messages').aggregate(query, function (err, results) {
                    return err ? reject(err) : resolve(results);
                });
            });
        }
    }, {
        key: 'create',
        value: function create(obj) {
            var _this2 = this;

            return new Promise(function (resolve, reject) {
                var id = _lodash2.default.get(obj, '_id', null);
                id = _lodash2.default.toString(id);
                var userId = new _mongodb.ObjectID(_lodash2.default.get(obj, 'userId'));
                var channelId = new _mongodb.ObjectID(_lodash2.default.get(obj, 'channelId'));
                var message = {
                    _id: new _mongodb.ObjectID(id),
                    body: _lodash2.default.get(obj, 'body', ''),
                    userId: userId,
                    channelId: channelId,
                    created: new Date()
                };
                _this2.app.db.collection('messages').insertOne(message, function (err, info) {
                    if (err) {
                        return reject(err);
                    }
                    // let update lastMessgage field to channel
                    _this2.app.db.collection('channels').findOneAndUpdate({ _id: channelId }, {
                        $set: {
                            lastMessage: _lodash2.default.get(message, 'body', ''),
                            updated: new Date()
                        }
                    });
                    _this2.app.models.user.load(_lodash2.default.toString(userId)).then(function (user) {
                        _lodash2.default.unset(user, 'password');
                        _lodash2.default.unset(user, 'email');
                        message.user = user;
                        return resolve(message);
                    }).catch(function (err) {
                        return reject(err);
                    });
                });
            });
        }
    }]);

    return Message;
}();

exports.default = Message;
//# sourceMappingURL=message.js.map