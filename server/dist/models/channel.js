'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _helper = require('../helper');

var _mongodb = require('mongodb');

var _immutable = require('immutable');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Channel = function () {
    function Channel(app) {
        _classCallCheck(this, Channel);

        this.app = app;
        this.channels = new _immutable.OrderedMap();
    }

    _createClass(Channel, [{
        key: 'aggregate',
        value: function aggregate(q) {
            var _this = this;

            return new Promise(function (resolve, reject) {
                _this.app.db.collection('channels').aggregate(q, function (err, results) {
                    return err ? reject(err) : resolve(results);
                });
            });
        }
    }, {
        key: 'find',
        value: function find(q) {
            var _this2 = this;

            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            console.log(q);
            return new Promise(function (resolve, reject) {
                _this2.app.db.collection('channels').find(q, options).toArray(function (err, results) {
                    return err ? reject(err) : resolve(results);
                });
            });
        }
    }, {
        key: 'load',
        value: function load(id) {
            var _this3 = this;

            return new Promise(function (resolve, reject) {
                id = _lodash2.default.toString(id);
                // first find in cache
                var channelFromCache = _this3.channels.get(id);
                if (channelFromCache) {
                    return resolve(channelFromCache);
                }
                // let find in db
                _this3.findById(id).then(function (c) {
                    _this3.channels = _this3.channels.set(id, c);
                    return resolve(c);
                }).catch(function (err) {
                    return reject(err);
                });
            });
        }
    }, {
        key: 'findById',
        value: function findById(id) {
            var _this4 = this;

            return new Promise(function (resolve, reject) {
                _this4.app.db.collection('channels').findOne({ _id: new _mongodb.ObjectID(id) }, function (err, result) {
                    if (err) {
                        return reject(err ? err : "Not found");
                    }
                    return resolve(result);
                });
            });
        }
    }, {
        key: 'create',
        value: function create(obj) {
            var _this5 = this;

            return new Promise(function (resolve, reject) {
                var id = (0, _helper.toString)(_lodash2.default.get(obj, '_id'));
                var idObject = id ? new _mongodb.ObjectID(id) : new _mongodb.ObjectID();
                var members = [];
                _lodash2.default.each(_lodash2.default.get(obj, 'members', []), function (value, key) {
                    var memberObjectId = new _mongodb.ObjectID(key);
                    members.push(memberObjectId);
                });
                var userIdObject = null;
                var userId = _lodash2.default.get(obj, 'userId', null);
                if (userId) {
                    userIdObject = new _mongodb.ObjectID(userId);
                }
                var channel = {
                    _id: idObject,
                    title: _lodash2.default.get(obj, 'title', ''),
                    lastMessage: _lodash2.default.get(obj, 'lastMessage', ''),
                    created: new Date(),
                    userId: userIdObject,
                    members: members
                };
              
                
              
                _this5.app.db.collection('channels').insertOne(channel, function (err, info) {
                    if (!err) {
                        var channelId = channel._id.toString();
                        _this5.channels = _this5.channels.set(channelId, channel);
                    }
                    return err ? reject(err) : resolve(channel);
                });
               
               
            });
        }
    }]);

    return Channel;
}();

exports.default = Channel;
//# sourceMappingURL=channel.js.map