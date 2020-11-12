'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
//const Nexmo = require('nexmo');


var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _helper = require('../helper');

var _bcrypt = require('bcrypt');

var _bcrypt2 = _interopRequireDefault(_bcrypt);

var _mongodb = require('mongodb');

var _immutable = require('immutable');

var _nexmo = require('nexmo');

var _nexmo2 = _interopRequireDefault(_nexmo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var saltRound = 10;

var User = function () {
    function User(app) {
        _classCallCheck(this, User);

        this.app = app;
        this.users = new _immutable.OrderedMap();
    }

    _createClass(User, [{
        key: 'updateUserStatus',
        value: function updateUserStatus(userId) {
            var _this = this;

            var isOnline = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            return new Promise(function (resolve, reject) {
                // first update status of cache this.users
                _this.users = _this.users.update(userId, function (user) {
                    if (user) {
                        user.online = isOnline;
                    }
                    return user;
                });
                var query = { _id: new _mongodb.ObjectID(userId) };
                var updater = { $set: { online: isOnline } };
                _this.app.db.collection('users').update(query, updater, function (err, info) {
                    return err ? reject(err) : resolve(info);
                });
            });
        }
    }, {
        key: 'find',
        value: function find() {
            var _this2 = this;

            var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            return new Promise(function (resolve, reject) {
                _this2.app.db.collection('users').find(query, options).toArray(function (err, users) {
                    return err ? reject(err) : resolve(users);
                });
            });
        }
    }, {
        key: 'search',
        value: function search() {
            var _this3 = this;

            var q = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";

            return new Promise(function (resolve, reject) {
                var regex = new RegExp(q, 'i');
                var query = {
                    $or: [{ name: { $regex: regex } }, { email: { $regex: regex } }]
                };
                _this3.app.db.collection('users').find(query, {
                    _id: true,
                    name: true,
                    created: true
                }).toArray(function (err, results) {

                    if (err || !results || !results.length) {
                        return reject({ message: "User not found." });
                    }
                    return resolve(results);
                });
            });
        }
    }, {
        key: 'login',
        value: function login(user) {
            var _this4 = this;

            var role = _lodash2.default.get(user, 'role', '');
            var email = _lodash2.default.get(user, 'email', '');
            var password = _lodash2.default.get(user, 'password', '');
            return new Promise(function (resolve, reject) {
                if (!password || !email || !(0, _helper.isEmail)(email)) {
                    return reject({ message: "An error login." });
                }
                // find in database with email
                _this4.findUserByEmail(email, function (err, result) {
                    if (err) {
                        return reject({ message: "Login Error." });
                    }
                    // if found user we have to compare the password hash and plain text.
                    var hashPassword = _lodash2.default.get(result, 'password');
                    var isMatch = _bcrypt2.default.compareSync(password, hashPassword);
                    if (!isMatch) {
                        return reject({ message: "Login Error." });
                    }
                    // user login successful let creat new token save to token collection.
                    var userId = result._id;
                    _this4.app.models.token.create(userId).then(function (token) {
                        token.user = result;
                        return resolve(token);
                    }).catch(function (err) {
                        return reject({ message: "Login error" });
                    });
                });
            });
        }
    }, {
        key: 'findUserByEmail',
        value: function findUserByEmail(email) {
            var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

            this.app.db.collection('users').findOne({ email: email }, function (err, result) {
                if (err || !result) {
                    return callback({ message: "User not found." });
                }
                return callback(null, result);
            });
        }
    }, {
        key: 'check',
        value: function check(reqId, code) {
            console.log("reqId and code in check method in user class : " + reqId + " " + code);
            return new Promise(function (resolve, reject) {
                var nexmo = new _nexmo2.default({
                    apiKey: '5ff68c1c',
                    apiSecret: '98M58gl906LXrf68'
                });
                nexmo.verify.check({
                    request_id: reqId,
                    code: code
                }, function (err, result) {
                    if (err) {
                        console.error(err);
                        reject(err);
                    } else {
                        console.log("successfully compared!");
                        resolve(result);
                    }
                });
            });
        }
    }, {
        key: 'verify',
        value: function verify(number) {

            return new Promise(function (resolve, reject) {
                var nexmo = new _nexmo2.default({
                    apiKey: '5ff68c1c',
                    apiSecret: '98M58gl906LXrf68'
                });
                nexmo.verify.request({
                    number: number,
                    brand: 'Vonage'
                }, function (err, result) {
                    if (err) {
                        console.error(err);
                        reject(err);
                    } else {
                        console.log("succesfully verified with reqId : " + result.request_id);
                        resolve(result);
                    }
                });
            });
        }
    }, {
        key: 'load',
        value: function load(id) {
            var _this5 = this;

            id = '' + id;
            return new Promise(function (resolve, reject) {
                // find in cache if found we return and dont nee to query db
                var userInCache = _this5.users.get(id);
                if (userInCache) {
                    return resolve(userInCache);
                }
                // if not found then we start query db
                _this5.findUserById(id, function (err, user) {
                    if (!err && user) {
                        _this5.users = _this5.users.set(id, user);
                    }
                    return err ? reject(err) : resolve(user);
                });
            });
        }
    }, {
        key: 'findUserById',
        value: function findUserById(id) {
            var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

            console.log("Begin query in database");
            if (!id) {
                return callback({ message: "User not found" }, null);
            }
            var userId = new _mongodb.ObjectID(id);
            this.app.db.collection('users').findOne({ _id: userId }, function (err, result) {
                if (err || !result) {
                    return callback({ message: "User not found" });
                }
                return callback(null, result);
            });
        }
    }, {
        key: 'beforeSave',
        value: function beforeSave(user) {
            var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : function () {};

            //fisr is validate user object before save to user collection
            var errors = [];
            var fields = ['role', 'name', 'email', 'password'];
            var validations = {
                role: {
                    errorMessage: 'Choose your role!',
                    do: function _do() {
                        var role = _lodash2.default.get(user, 'role', '');
                        if (!role == "student" && !role == "mentor") {
                            return false;
                        }
                        return true;
                    }
                },
                name: {
                    errorMessage: 'Name is required ',
                    do: function _do() {
                        var name = _lodash2.default.get(user, 'name', '');
                        return name.length;
                    }
                },
                email: {
                    errorMessage: 'Email is not correct ',
                    do: function _do() {
                        var email = _lodash2.default.get(user, 'email', '');
                        if (!email.length || !(0, _helper.isEmail)(email)) {
                            return false;
                        }
                        return true;
                    }
                },
                password: {
                    errorMessage: 'Password is required and more than 3 characters',
                    do: function _do() {
                        var password = _lodash2.default.get(user, 'password', '');
                        if (!password.length || password.length < 3) {
                            return false;
                        }
                        return true;
                    }
                }

                // loop all fields to check if valid or not.
            };fields.forEach(function (field) {
                var fieldValidation = _lodash2.default.get(validations, field);
                if (fieldValidation) {
                    // do check/
                    var isValid = fieldValidation.do();
                    var msg = fieldValidation.errorMessage;
                    if (!isValid) {
                        errors.push(msg);
                    }
                }
            });
            if (errors.length) {
                // this is not pass of the validation.
                var err = _lodash2.default.join(errors, ',');
                return callback(err, null);
            }
            // check email is exist in db or not
            var email = _lodash2.default.toLower(_lodash2.default.trim(_lodash2.default.get(user, 'email', '')));
            this.app.db.collection('users').findOne({ email: email }, function (err, result) {
                if (err || result) {
                    return callback({ message: "Email is already exist" }, null);
                }
                // return callback with succes checked.
                var password = _lodash2.default.get(user, 'password');
                var hashPassword = _bcrypt2.default.hashSync(password, saltRound);
                var userFormatted = {
                    role: _lodash2.default.get(user, 'role'),
                    name: '' + _lodash2.default.trim(_lodash2.default.get(user, 'name')),
                    email: email,
                    password: hashPassword,
                    created: new Date()
                };
                return callback(null, userFormatted);
            });
        }
    }, {
        key: 'create',
        value: function create(user) {
            var _this6 = this;

            var db = this.app.db;
            console.log("User:", user);
            return new Promise(function (resolve, reject) {
                _this6.beforeSave(user, function (err, user) {
                    console.log("After validation: ", err, user);
                    if (err) {
                        return reject(err);
                    }
                    //insert new user object to users collection
                    db.collection('users').insertOne(user, function (err, info) {
                        //check if error return error to user
                        if (err) {
                            return reject({ message: 'An error saving user' });
                        }
                        //otherwise, return user object to user.
                        var userId = _lodash2.default.get(user, '_id').toString(); // this is OBJET ID
                        _this6.users = _this6.users.set(userId, user);
                        return resolve(user);
                    });
                });
            });
        }
    }]);

    return User;
}();

exports.default = User;
//# sourceMappingURL=user.js.map