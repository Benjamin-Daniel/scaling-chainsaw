
const express = require('express'),
    group = express.Router(),
    mongoose = require('mongoose'),
    User = require('./models/User'),
    Group = require('./models/Group'),
    checkLogErr = require('./controllers/app.controller'),
    session = require('express-session'),
    app = express();
    server = require('http').createServer(app),
	io = require('socket.io').listen(server);





group.get('/', function (req, res) {
    if (req.session.user) {
        io.sockets.on('connection', function (socket) {
            console.log(socket)
            socket.on('send message', function (data) {
                io.sockets.emit('new message', { msg: data });
            })
        })
        res.status(200).render('pages/group');
    } else {
        res.status(401).redirect('/signin');
    }
})

group.post('/', function (req, res) {
    if (!req.session.user) {
        res.status(401).send("u ain't a user bro");
    } else {
        var name = req.body.name;
        var currentUser = req.session.user;
        var admin = currentUser.username;

        User.findOne({ username: admin }, function (err, user) {
            if (err) {
                console.log(err);
            }

            if (!user) {
                res.status(404).send("This user does not exists");
            }

            var newgroup = new Group;
            newgroup.name = name;
            newgroup.admin = admin;
            newgroup.users.push(admin);
            newgroup.save(function (err, savedObject) {
                if (err) {
                    console.log(err);
                    return res.status(500).send()
                }
                var userGroups = {
                    name: name,
                    groupId: newgroup.id
                }
                user.groups.push(userGroups);
                user.save(function (err, savedUser) {
                    if (err) {
                        console.log(err);
                    }
                    res.redirect('/profile')
                })
            });
        })
    }
});

group.post('/:groupid/user', function (req, res) {

    if (req.session.user) {
        var currentUser = req.session.user.username;
        var id = req.params.groupid;
        var userToAdd = req.body.user;

        User.findOne({ username: userToAdd }, function (err, founduser) {
            if (err) {
                console.log(err);
                return res.status(500).send();
            }
            if (!founduser) {
                return res.status(404).send("The guy u are trying to add is not a user");
            }
            Group.findById(id, function (err, doc) {
                if (err) {
                    console.log(err);
                    return res.status(500).send();
                }
                if (!doc) {
                    res.status(404).send("No group with such id found");
                } else {
                    var check = false;
                    var group = doc.name
                    var groups = founduser.groups;
                    for (var j = 0; j < groups.length; j++) {
                        if (groups[j].name == group) {
                            check = true;
                        }
                    }
                    if (check == false) {
                        var userGroups = {
                            name: group,
                            groupId: doc.id
                        }
                        groups.push(userGroups);
                        founduser.save();
                    };

                    var checkGroup = false;
                    for (var j = 0; j < doc.users.length; j++) {
                        if (doc.users[j] == userToAdd) {
                            checkGroup = true;
                        }
                    };
                    if (checkGroup == false) {
                        doc.users.push(userToAdd);
                    };
                    doc.save(function (err, savedUser) {
                        if (err) {
                            console.log(err);
                            return res.status(500).send();
                        }
                        console.log(currentUser)
                        User.find({ username: currentUser }, function (err, user) {
                            if (err) {
                                console.log(err);
                            }
                            res.status(200).send("the user has been added")
                        });
                    });
                }
            });
        })
    } else {
        res.status(401).send("U need to log in")
    }
});



group.post('/:groupid/message', function (req, res) {

    if (req.session.user) {
        var username = req.session.user.username,
            message = req.body.message,
            id = req.params.groupid,
            time = new Date().getTime();

        Group.findById(id, function (err, grp) {
            if (err) {
                console.log(err);
                res.status(500).send();
            }
            if (!grp) {
                res.status(404).send("No group with such group id")
            }
            var users = grp.users,
                check = false;
            for (var i = 0; i < users.length; i++) {
                if (users[i] == username) {
                    check = true;
                }
            }

            if (check == true) {
                var posts = grp.posts
                var postdata = {
                    username: username,
                    message: message,
                    time: time
                };
                var post = postdata;
                grp.posts.push(post);
                grp.save(function (err, savedPost) {
                    if (err) {
                        console.log(err);
                        return res.status(500).send();
                    }
                    return res.status(200).redirect(`/group/${id}`);
                });
            } else {
                res.status(401).send("U ain't a user of this group")
            }

        })
    } else {
        res.status(401).send("U are not logged in")
    }
});

group.get('/:groupid', function (req, res) {
    if (req.session.user) {
        var username = req.session.user.username,
            id = req.params.groupid;

        User.findOne({ username: username }, function (err, user) {
            if (err) {
                console.log(err);
                return res.status(500).send();
            }
            if (!user) {
                res.status(404).send("U ain't a user bro")
            }
            var groups = user.groups;
            console.log(user);
            Group.findById(id, function (err, grp) {
                if (err) {
                    console.log(err);
                    return res.status(500).send();
                }
                if (!grp) {
                    return res.status(404).send("No Group with such id");
                }

                var users = grp.users;
                var check = false;
                for (var i = 0; i < users.length; i++) {
                    if (users[i] == username) {
                        check = true;
                    }
                }
                if (check == true) {
                    res.status(200).render('pages/dashboard', {
                        user: user,
                        presentUser: username,
                        group: grp
                    });
                } else {
                    res.status(404).send("U ain't a user of this grp");
                }
            })
        })
    } else {
        res.status(404).redirect('/signin');
    }
});

group.delete('/:groupId', function (req, res) {
    var groupId = req.params.groupId;
    if (req.session.user) {
        Group.findOne({ _id: groupId }, function (err, groupfound) {
            if (err) {
                return res.status(500).send(err);
            }

            const { username } = req.session.user;
            if (username == groupfound.admin) {
                Group.remove({ _id: groupId }, function (err, bool) {
                    if (err) {
                        return res.status(500).send(err);
                    }
                    return res.send('the group has been deleted')
                })
            } else {
                res.send('you not the admin')
            }

        })
    } else {
        res.send("You will need to signin or signup");
    }
})

module.exports = group;