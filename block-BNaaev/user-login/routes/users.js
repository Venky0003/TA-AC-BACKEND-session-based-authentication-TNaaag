var express = require('express');
var router = express.Router();
var User = require('../models/user')

/* GET users listing. */
router.get("/", function(req, res, next) {
  res.render('user');
});

router.get("/register", (req, res, next) =>{
  res.render('register')
})
router.post("/register",(req, res, next) =>{
  User.create(req.body).then((user) =>{
    res.redirect('/users/login')
  }).catch(error => console.log(error))
})

router.get('/login', (req, res, next) =>{
  res.render('login')
})


module.exports = router;

