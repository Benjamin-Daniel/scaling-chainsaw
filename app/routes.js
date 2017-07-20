const   express = require('express'),
        router = express.Router(),
        mongoose = require('mongoose'),
        User = require('./models/User'),
        Group = require('./models/Group'),
        session = require('express-session');        


/* GET home page. */
router.get('/', function(req, res) {
    res.status(200).render('pages/index');
});

// get the login page 
router.get('/signin', function(req, res) {
    res.status(200).render('pages/login')
});

router.post('/signin', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;

    User.findOne({username: username}, function(err, user) {
        if(err) {
            console.log(err);
            return res.status(500).send();
        }
        if(!user) {
            return res.status(404).send("you are not a user");
        }
        
        user.comparePassword(password, function (err, isMatch) {
            if (isMatch && isMatch == true) {
                req.session.user = user;
                return res.status(200).redirect('profile');
            } else {
                return res.status(401).send("you ain't a user");
            }
        });
    });
});

router.post('/signup', function(req, res) {
        var username = req.body.username;
        var password = req.body.password;
        var email    = req.body.email;

        var newuser = new User()
        newuser.username = username;  
        newuser.password = password;  
        newuser.email = email;   
        newuser.save(function(err, savedObject) {
            if(err) {
                console.log(err);
                return res.status(500).send()
            }
            return res.status(200).send("signed up completely");
        });
});

router.get('/logout', function(req, res) {
    req.session.destroy();
    return res.status(200).send("Successfully logged out")
})

router.post('/group', function(req, res) {
    if(!req.session.user) {
        res.status(401).send("u ain't a user bro");
    } else {
        var name = req.body.name;
        var user = req.session.user;
        var admin = user.username;

        var newgroup = new Group;
        newgroup.name       = name;
        newgroup.admin      = admin;
        newgroup.users.push(admin);
        newgroup.save(function(err, savedObject) {
            if(err) {
                console.log(err);
                return res.status(500).send()
            }
            return res.status(200).send("sucessfully saved" + savedObject);
        });
    }
});

router.post('/group/:groupid/user', function(req, res) {

    if (req.session.user) {
        var id = req.params.groupid;
        var name = req.body.user;

        User.findOne({username: name} , function(err, user) {
            if(err) {
                console.log(err);
                return res.status(500).send();
            }
            if(!user) {
                return res.status(404).send("The guy u are trying to add is not a user");
            }
            Group.findById(id, function(err, doc) {
                if(err) {
                    console.log(err);
                    return res.status(500).send();
                }
                if(!doc) {
                    res.status(404).send("No group with such id found");
                } else {
                    var checkGroup = false;
                    for (var i = 0; i < user.groups.length; i++) {
                        if (user.groups[i] == name) {
                            checkGroup = true;
                        }
                    }
                    if(checkGroup == false) {
                        user.groups.push(doc.name);
                        user.save();
                    }   
                    console.log(checkGroup);
                    
                    user.save();
                    doc.users.push(name);
                    doc.save(function(err, savedUser) {
                        if(err) {
                            console.log(err);
                            return res.status(500).send();
                        }
                        return res.status(200).send(user.groups)           
                    });
                }
            })
        })
    } else {
        res.status(401).send("U need to log in")
    }
})

router.post('/group/:groupid/message', function(req, res) {

    if(req.session.user) {
        var username    = req.session.user.username,
            message     = req.body.message,
            id          = req.params.groupid,
            time        = new Date().getTime();

        Group.findById(id, function(err, grp) {
            if (err) {
                console.log(err);
                res.status(500).send();
            }
            if(!grp) {
                res.status(404).send("No group with such group id")
            }
            var users = grp.users;
            var check = false;
            for (var i = 0; i < users.length; i++) {
                if (users[i] == username) {
                    check = true;
                }
            }
            console.log(check)
            if( check == true) {
                var posts = grp.posts
                var postdata = {
                    username: username,
                    message: message,
                    time: time
                };
                var post = postdata;
                grp.posts.push(post);
                grp.save(function(err, savedPost) {
                    if(err) {
                        console.log(err);
                        return res.status(500).send();
                    }
                    return res.status(200).send(grp);
                })
                console.log(post);
            } else {
                res.status(401).send("U ain't a user of this group")
            }

        })
    } else {
        res.status(401).send("U are not logged in")
    }
});

router.get('/profile', function(req, res) {
    if(req.session.user) {
        res.status(200).render('pages/profile');
    } else {
        res.status(401).redirect('/');
    }
});
module.exports = router;
