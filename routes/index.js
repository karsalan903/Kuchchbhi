var express = require('express');
const passport = require('passport');
var router = express.Router();

const userModel = require("./users");
const productModel = require("./products");

const localStrategy = require('passport-local');
passport.use(new localStrategy(userModel.authenticate()));


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/profile', isLoggedIn, function(req, res, next){
  userModel.findOne({username: req.session.passport.user})
  .then(function(loggedInUser){
    res.render('profile', {loggedInUser});
  });
});

router.get('/login', function(req, res, next){
  res.render('login');
});

router.post('/createProduct', isLoggedIn, function(req, res, next){
  userModel.findOne({username: req.session.passport.user})
  .then(function(loggedInUser){
    productModel.create({
      userid: loggedInUser._id,
      name: req.body.name,
      price: req.body.price
    })
    .then(function(product){
      loggedInUser.products.push(product._id);
      loggedInUser.save()
      .then(function(){
        res.redirect('back');
      });
    });
  });
});

router.get('/products', isLoggedIn, function(req, res, next){
  userModel.findOne({username: req.session.passport.user})
  .then(function(loggedInUser){
    productModel.find()
    .populate("userid")
    .then(function(products){
      res.render('products', {products, loggedInUser});
    });
  });
});

router.get('/cart/:id', isLoggedIn, function(req, res, next){
  userModel.findOne({username: req.session.passport.user})
  .then(function(loggedInUser){
    loggedInUser.cart.push(req.params.id);
    loggedInUser.save()
    .then(function(){
      res.redirect("back");
    });
  });
});

router.get('/cart', isLoggedIn, function(req, res, next){
  userModel.findOne({username: req.session.passport.user})
  .then(function(loggedInUser){
    productModel.find()
    .populate("userid")
    .then(function(cart){
      res.render('cart', {cart, loggedInUser});
    });
  });
});

router.get('/remove/cart/:id', isLoggedIn, function(req, res, next){
  userModel.findOne({username: req.session.passport.user})
  .then(function(loggedInUser){
    let index = loggedInUser.cart.indexOf(req.params.id)
    loggedInUser.cart.splice(index, 1);
    loggedInUser.save()
    .then(function(){
      res.redirect("back");
    });
  });
});

router.get('/edit', isLoggedIn, function(req, res, next){
  userModel.findOne({username: req.session.passport.user})
  .then(function(loggedInUser){
    res.render('edit', {loggedInUser});
  });
});

router.post('/update', isLoggedIn, function(req, res, next){
  userModel.findOneAndUpdate({username: req.session.passport.user}, {username: req.body.name, email: req.body.email, photo: req.body.photo})
  .then(function(updateduser){
    res.redirect('/products');
  });
});

router.get('/delete', isLoggedIn, function(req, res, next){
  userModel.findOneAndDelete({username: req.session.passport.user})
  .then(function(deletedUser){
    res.redirect('back');
  });
});

router.post('/register', function(req, res, next){
  var data = new userModel({
    username: req.body.username,
    email: req.body.email,
    photo: req.body.photo
  })
  userModel.register(data, req.body.password)
  .then(function(registeredUser){
      passport.authenticate("local")(req, res, function(){
        res.redirect("/profile");
    });
  });
});

router.post('/login', passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/login"
}), function(req, res, next){});

router.get('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  else{
    res.redirect('/login');
  }
}

module.exports = router;
