var express = require('express');
var router = express.Router();
var User = require('../models/user');

/* GET users listing. */
router.get('/', function (req, res, next) {
  console.log(req.session);
  res.render('users');
});

router.get('/register', (req, res, next) => {
  res.render('register');
});

router.post('/register', (req, res, next) => {
  User.create(req.body).then((user) => {
    // console.log(user)
    res.redirect('/users/login');
  });
});

router.get('/login', (req, res, next) => {
  res.render('login');
});

router.post('/login', (req, res, next) => {
  var { email, password } = req.body;
  console.log(email, password);
  if (!email || !password) {
    res.redirect('/users/login');
  }
  User.findOne({ email }).then((user) => {
    console.log(user);
    // no user
    if (!user) {
     return  res.redirect('/users/login');
    }
    // user compare password
    user.verifyPassword(password, (err, result) => {
      // console.log(result)
      if (err) return next(err);
      if (!result) {
        return res.redirect('/users/login');
      } // else{
      //   res.render()
      // }
      req.session.userId = user.id;
      res.redirect('/users'); 
    });
  });
});

module.exports = router;
