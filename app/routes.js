const   express = require('express'),
        router = express.Router(),
        mongoose = require('mongoose'),
        User = require('./models/User'),
        Group = require('./models/Group'),
        checkLogErr = require('./controllers/app.controller'),
        session = require('express-session');



/* GET home page. */
router.get('/', function(req, res) {
    if(req.session.user) {
        res.status(200).redirect('/profile');
    } else {
        res.status(200).render('pages/index');
    }
});

// get the login page 
router.get('/signin', function(req, res) {
    res.status(200).render('pages/signin')
});

router.post('/signin', function(req, res) {
    var username = req.body.username,
        password = req.body.password;

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
                return res.status(200).redirect('/profile');
            } else {
                return res.status(401).send("you ain't a user");
            }
        });
    });
});
router.get('/signup', function(req, res) {
    res.status(200).render('pages/signup');
})

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
            return res.status(200).redirect('signin');
        });
});

router.get('/logout', function(req, res) {
    req.session.destroy();
    return res.status(200).redirect('/')
});


router.get('/profile', function(req, res) {
    if(req.session.user) {
        var currentUser = req.session.user;
        var name = currentUser.username;
        User.findOne({username: name}, function(err, user) {
            if (err) {
                console.log(err);
            }
            var groups = user.groups
            res.status(200).render('pages/profile', {
                user: user,
                groups: groups});
        })
    } else {
        res.status(401).redirect('/signin');
    }
});

module.exports = router;
