'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _user = require('./user');

var _user2 = _interopRequireDefault(_user);

var _token = require('./token');

var _token2 = _interopRequireDefault(_token);

var _connection = require('./connection');

var _connection2 = _interopRequireDefault(_connection);

var _channel = require('./channel');

var _channel2 = _interopRequireDefault(_channel);

var _message = require('./message');

var _message2 = _interopRequireDefault(_message);

var _event = require('./event');

var _event2 = _interopRequireDefault(_event);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Model = function Model(app) {
    _classCallCheck(this, Model);

    this.app = app;

    this.user = new _user2.default(app);
    this.token = new _token2.default(app);
    this.channel = new _channel2.default(app);
    this.message = new _message2.default(app);
    this.event = new _event2.default(app);
    this.connection = new _connection2.default(app);
};

exports.default = Model;
//# sourceMappingURL=index.js.map