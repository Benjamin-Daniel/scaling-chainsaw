const   User      = require('../models/User'),
        mongoose  = require('mongoose'),
        session = require('express-session');

module.exports = {

    showLogin: function(req, res) {
        if (!req.session.user) {
            res.render('pages/login')
        }
         res.redirect('pages/profile');
    },
    processLogin: function(req, res) {
        var username = req.body.username;
        var password = req.body.password;

        User.findOne({username: username}, function(err, user) {
            if(err) {
                console.log(err);
                return res.status(500).send();
            }
            if(!user) {
                return res.status(404).send("you not not a user");
            }
            
            user.comparePassword(password, function (err, isMatch) {
                if (isMatch && isMatch == true) {
                    req.session.user = user;
                    return res.status(200).redirect(`/profile`);
                } else {
                    return res.status(401).redirect();
                }
            });
        });
 
    },
    allUsers: function(req, res) {
        var select = req.query.select,
        database = [];

        User.find({}, function(err, foundData) {
            if (err){ 
            console.log(err);
            res.status(500).send();
        } else {
            if(foundData.length == 0) {
                var responseObject = undefined;
                if (select && select == 'count') {
                    responseObject = {count: 0};
                }

                res.status(404).send(responseObject);
            } else {
                var responseObject = foundData;
                if (select && select == 'count') {
                    responseObject = {count: foundData.length};
                }
                res.send(responseObject);
            }
        }

        });
    },
    processRegistration: function(req, res) {
        var username = req.body.username;
        var password = req.body.password;
        var email = req.body.email;

        var newuser = new User();
        newuser.username = username;  
        newuser.password = password;  
        newuser.email = email;   
        newuser.save(function(err, savedObject) {
            if(err) {
                console.log(err);
                return res.status(500).send()
            }
            return res.status(200).send();
        });
        res.redirect('/login');
    },
    getProfile : function(req, res) {
        var currentUser = req.session.user;
        if(req.session.user) {
            return res.render('pages/profile', {user: req.session.user})
        }
        return res.status(401).redirect('/login');
    },
    registration: function(req, res) {
        res.render('pages/register')
    },
    out: function(req, res) {
        req.session.destroy();
        return res.status(200).redirect('/');
    },
    showHome: function(req, res) {
        //res.render('pages/index')
            if (req.session.user){

            res.render('pages/profile', {user: req.session.user});

        } else {

            res.render('pages/index');
        }
    }
}
