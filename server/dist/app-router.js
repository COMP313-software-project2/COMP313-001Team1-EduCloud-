'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.START_TIME = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var START_TIME = exports.START_TIME = new Date();

var AppRouter = function () {
    function AppRouter(app) {
        _classCallCheck(this, AppRouter);

        this.app = app;
        this.setupRouter = this.setupRouter.bind(this);
        this.setupRouter();
    }

    _createClass(AppRouter, [{
        key: 'setupRouter',
        value: function setupRouter() {
            var _this = this;

            var app = this.app;
            console.log("App Router works!");
            /**
            * @endpoint: /api/users
            * @method: POST
            **/
            app.post('/api/users', function (req, res, next) {
                var body = req.body;
                app.models.user.create(body).then(function (user) {
                    _lodash2.default.unset(user, 'password');
                    return res.status(200).json(user);
                }).catch(function (err) {
                    return res.status(503).json({ error: err });
                });
            });
            app.post('/api/verify', function (req, res, next) {
                console.log("INSIDE api/user/verify app-router");
                var number = req.body.number;
                console.log("number passed : " + number);
                app.models.user.verify(number).then(function (result) {
                    console.log("verify reqId result : " + result.request_id);
                    return res.status(200).json(result);
                }).catch(function (err) {
                    return res.status(503).json({ error: err });
                });
            });
            app.post('/api/check', function (req, res, next) {
                var code = req.body.code;
                var reqId = req.body.reqId;
                app.models.user.check(reqId, code).then(function (result) {
                    return res.status(200).json(result);
                }).catch(function (err) {
                    return res.status(503).json({ error: err });
                });
            });

            app.post('/api/events', function (req, res) {

                var body = req.body;
                console.log("inside app-router : " + body);
                app.models.event.create(body).then(function (event) {
                    return res.status(200).json(event);
                }).catch(function (err) {
                    return res.status(503).json({ error: err });
                });
            });
            app.get('/api/events/:id', function (req, res, next) {
                console.log("INSIDE app.get event ");
                var userId = _lodash2.default.get(req, 'params.id');
                _this.app.models.event.getAll(userId).then(function (events) {
                    //console.log("INSIDE app.get event => userId : " + userId)
                    console.log("INSIDE this also, events : " + events);
                    var eventsarr = [];
                    _lodash2.default.each(events, function (event) {
                        var jsonEvent = JSON.stringify(event);
                        var ajsonEvnet = JSON.parse(jsonEvent);
                        eventsarr.push(ajsonEvnet);
                    });

                    return res.status(200).json(eventsarr);
                }).catch(function (err) {
                    console.log("inside app-router, event.getAll : " + err);
                    return res.status(404).json({ error: { message: "event not found " } });
                });
            });
            app.get('/api/event/:id', function (req, res, next) {
                console.log("inside event/:id method");
                var eventId = _lodash2.default.get(req, 'params.id');
                console.log("this is event Id : " + eventId);
                app.models.event.load(eventId).then(function (event) {
                    return res.status(200).json(event);
                }).catch(function (err) {
                    return res.status(400).json(err);
                });
            });

            app.post('/api/event/:id', function (req, res) {
                var body = req.body;
                var eventId = _lodash2.default.get(req, 'params.id');
                app.models.event.update(body, eventId).then(function (event) {
                    return res.status(200).json(event);
                }).catch(function (err) {
                    return res.status(400).json(err);
                });
            });
            app.post('/api/event/delete/:id', function (req, res) {
                var eventId = _lodash2.default.get(req, 'params.id');
                console.log("inside app-router DELETE : " + eventId);
                app.models.event.delete(eventId).then(function () {
                    return res.status(200).json();
                }).catch(function (err) {
                    return res.status(400).json(err);
                });
            });

            app.get('/api/users/me', function (req, res, next) {
                var tokenId = req.get('authorization');
                if (!tokenId) {
                    // get token from query
                    tokenId = _lodash2.default.get(req, 'query.auth');
                }
                app.models.token.loadTokenAndUser(tokenId).then(function (token) {
                    _lodash2.default.unset(token, 'user.password');
                    return res.json(token);
                }).catch(function (err) {
                    return res.status(401).json({
                        error: err
                    });
                });
            });

            app.post('/api/users/search', function (req, res, next) {
                var keyword = _lodash2.default.get(req, 'body.search', '');
                app.models.user.search(keyword).then(function (results) {
                    return res.status(200).json(results);
                }).catch(function (err) {
                    return res.status(404).json({
                        error: 'Not found.'
                    });
                });
            });

            app.get('/api/users/:id', function (req, res, next) {
                var userId = _lodash2.default.get(req, 'params.id');
                app.models.user.load(userId).then(function (user) {
                    _lodash2.default.unset(user, 'password');
                    return res.status(200).json(user);
                }).catch(function (err) {
                    return res.status(404).json({
                        error: err
                    });
                });
            });

            app.post('/api/users/login', function (req, res, next) {
                var body = _lodash2.default.get(req, 'body');
                app.models.user.login(body).then(function (token) {
                    _lodash2.default.unset(token, 'user.password');
                    return res.status(200).json(token);
                }).catch(function (err) {
                    return res.status(401).json({
                        error: err
                    });
                });
            });

            app.get('/api/channels/:id', function (req, res, next) {
                var channelId = _lodash2.default.get(req, 'params.id');
                console.log(channelId);
                if (!channelId) {
                    return res.status(404).json({ error: { message: "Not found." } });
                }
                app.models.channel.load(channelId).then(function (channel) {
                    // fetch all uses belong to memberId
                    var members = channel.members;
                    var query = {
                        _id: { $in: members }
                    };
                    var options = { _id: 1, name: 1, created: 1 };
                    app.models.user.find(query, options).then(function (users) {
                        channel.users = users;
                        return res.status(200).json(channel);
                    }).catch(function (err) {
                        return res.status(404).json({ error: { message: "Not found." } });
                    });
                }).catch(function (err) {
                    return res.status(404).json({ error: { message: "Not found." } });
                });
            });

            app.get('/api/channels/:id/messages', function (req, res, next) {
                var tokenId = req.get('authorization');
                if (!tokenId) {
                    // get token from query
                    tokenId = _lodash2.default.get(req, 'query.auth');
                }
                app.models.token.loadTokenAndUser(tokenId).then(function (token) {
                    var userId = token.userId;
                    // make sure user are logged in
                    // check if this user is inside of channel members. other retun 401
                    var filter = _lodash2.default.get(req, 'query.filter', null);
                    if (filter) {
                        filter = JSON.parse(filter);
                        console.log(filter);
                    }
                    var channelId = _lodash2.default.toString(_lodash2.default.get(req, 'params.id'));
                    var limit = _lodash2.default.get(filter, 'limit', 50);
                    var offset = _lodash2.default.get(filter, 'offset', 0);
                    // load channel
                    _this.app.models.channel.load(channelId).then(function (c) {
                        var memberIds = _lodash2.default.get(c, 'members');
                        var members = [];
                        _lodash2.default.each(memberIds, function (id) {
                            members.push(_lodash2.default.toString(id));
                        });
                        if (!_lodash2.default.includes(members, _lodash2.default.toString(userId))) {
                            return res.status(401).json({ error: { message: "Access denied" } });
                        }
                        _this.app.models.message.getChannelMessages(channelId, limit, offset).then(function (messages) {
                            return res.status(200).json(messages);
                        }).catch(function (err) {
                            return res.status(404).json({ error: { message: "Not found." } });
                        });
                    }).catch(function (err) {
                        return res.status(404).json({ error: { message: "Not found." } });
                    });
                }).catch(function (err) {
                    return res.status(401).json({ error: { message: "Access denied" } });
                });
            });

            app.get('/api/me/channels', function (req, res, next) {
                var tokenId = req.get('authorization');
                if (!tokenId) {
                    // get token from query
                    tokenId = _lodash2.default.get(req, 'query.auth');
                }
                app.models.token.loadTokenAndUser(tokenId).then(function (token) {
                    var userId = token.userId;
                    var query = [{
                        $lookup: {
                            from: 'users',
                            localField: 'members',
                            foreignField: '_id',
                            as: 'users'
                        }
                    }, {
                        $match: {
                            members: { $all: [userId] }
                        }
                    }, {
                        $project: {
                            _id: true,
                            title: true,
                            lastMessage: true,
                            created: true,
                            updated: true,
                            userId: true,
                            users: {
                                _id: true,
                                name: true,
                                created: true,
                                online: true
                            },
                            members: true
                        }
                    }, {
                        $sort: { updated: -1, created: -1 }
                    }, {
                        $limit: 50
                    }];
                    app.models.channel.aggregate(query).then(function (channels) {
                        return res.status(200).json(channels);
                    }).catch(function (err) {
                        return res.status(404).json({ error: { message: "Not found." } });
                    });
                }).catch(function (err) {
                    return res.status(401).json({
                        error: "Access denied."
                    });
                });
            });

            app.get('/api/me/logout', function (req, res, next) {
                var tokenId = req.get('authorization');
                if (!tokenId) {
                    // get token from query
                    tokenId = _lodash2.default.get(req, 'query.auth');
                }
                app.models.token.loadTokenAndUser(tokenId).then(function (token) {
                    app.models.token.logout(token);
                    return res.status(200).json({
                        message: 'Successful.'
                    });
                }).catch(function (err) {
                    return res.status(401).json({ error: { message: 'Access denied' } });
                });
            });
        }
    }]);

    return AppRouter;
}();

exports.default = AppRouter;
//# sourceMappingURL=app-router.js.map