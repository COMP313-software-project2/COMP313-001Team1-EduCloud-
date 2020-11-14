'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _mongodb = require('mongodb');

var _immutable = require('immutable');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Token = function () {
	function Token(app) {
		_classCallCheck(this, Token);

		this.app = app;

		this.tokens = new _immutable.OrderedMap();
	}

	_createClass(Token, [{
		key: 'logout',
		value: function logout(token) {
			var _this = this;

			return new Promise(function (resolve, reject) {

				var tokenId = _lodash2.default.toString(token._id);
				// to remove token from cache
				_this.tokens = _this.tokens.remove(tokenId);
				// we have to delete this token id from tokens collection

				_this.app.db.collection('tokens').remove({ _id: new _mongodb.ObjectID(tokenId) }, function (err, info) {

					return err ? reject(err) : resolve(info);
				});
			});
		}
	}, {
		key: 'loadTokenAndUser',
		value: function loadTokenAndUser(id) {
			var _this2 = this;

			return new Promise(function (resolve, reject) {

				_this2.load(id).then(function (token) {

					var userId = '' + token.userId;

					_this2.app.models.user.load(userId).then(function (user) {

						token.user = user;
						return resolve(token);
					}).catch(function (err) {

						return reject(err);
					});
				}).catch(function (err) {
					return reject(err);
				});
			});
		}
	}, {
		key: 'load',
		value: function load() {
			var _this3 = this;

			var id = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;


			id = '' + id;

			return new Promise(function (resolve, reject) {

				// first we check in cache if found dont need to query to database.

				var tokenFromCache = _this3.tokens.get(id);
				if (tokenFromCache) {

					return resolve(tokenFromCache);
				}

				_this3.findTokenById(id, function (err, token) {

					if (!err && token) {

						var tokenId = token._id.toString();

						_this3.tokens = _this3.tokens.set(tokenId, token);
					}
					return err ? reject(err) : resolve(token);
				});
			});
		}
	}, {
		key: 'findTokenById',
		value: function findTokenById(id) {
			var cb = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};


			//console.log("Begin query into database!!!!!!");


			var idObject = new _mongodb.ObjectID(id);

			var query = { _id: idObject };
			this.app.db.collection('tokens').findOne(query, function (err, result) {

				if (err || !result) {

					return cb({ message: "Not found" }, null);
				}

				return cb(null, result);
			});
		}
	}, {
		key: 'create',
		value: function create(userId) {
			var _this4 = this;

			var token = {
				userId: userId,
				created: new Date()
			};

			return new Promise(function (resolve, reject) {

				_this4.app.db.collection('tokens').insertOne(token, function (err, info) {
					return err ? reject(err) : resolve(token);
				});
			});
		}
	}]);

	return Token;
}();

exports.default = Token;
//# sourceMappingURL=token.js.map