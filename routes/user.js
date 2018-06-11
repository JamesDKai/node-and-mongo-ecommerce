var express = require('express');
var router = express.Router();
var async = require('async');
var User = require('../models/User');
var Cart = require('../models/cart');
var passport = require('passport');
var passportConf = require('../config/passport');

router.get('/login', function(req, res) {
  if(req.user) return res.redirect('/');
  res.render('accounts/login', { message: req.flash('loginMessage')});
});

router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true
}));

router.get('/profile', passportConf.isAuthenticated, function(req, res, next) {
  User
    .findOne({ _id: req.user._id })
    .populate('history.item')
    .exec(function(err, foundUser) {
      if (err) return next(err);

      res.render('accounts/profile', { user: foundUser });
    });
});

router.get('/signup', function(req, res, next) {
  res.render('accounts/signup', {
    errors: req.flash('errors')
  });
});

// path for User Creation
router.post('/signup', function(req, res, next) {

  async.waterfall([
    function(callback) {
      var user = new User;

      user.profile.name = req.body.name;
      user.email = req.body.email;
      user.password = req.body.password;
      user.profile.picture = user.gravatar();

      User.findOne({email: req.body.email}, function(err, existingUser) {
        if (existingUser) {
          req.flash('errors', 'Account with that email address already exists');
          return res.redirect('/signup');
        } else {
          user.save(function(err, user) {
            if (err) return next(err);
            callback(null, user);
          });
        }
      });
    },
    function(user) {
      var cart = new Cart();
      cart.owner = user._id;
      cart.save(function(err) {
        if (err) return next(err);
        req.logIn(user, function(err) {
          if (err) return next(err);
          res.redirect('/profile');
        });
      });
    }
  ]);
});

router.get('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/');
});

router.get('/edit-profile', function(req, res, next) {
  res.render('accounts/edit-profile', { message: req.flash('success')});
});

router.post('/edit-profile', function(req, res, next) {
  User.findOne({ _id: req.user._id}, function(err, user) {
    if (err) return next (err);
    if (req.body.name) user.profile.name = req.body.name;
    // if (req.body.email) user.email = req.body.email;
    if (req.body.address) user.address = req.body.address;

    user.save(function(err) {
      if (err) return next(err);
      req.flash('success', 'Successfully Edited Your Profile');
      return res.redirect('/edit-profile');
    });
  });
});

module.exports = router;
