var express   = require('express');
var router    = express.Router();
var passport  = require("passport");
var User      = require("../models/user");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");


//==============================================================root rout================================================//
router.get("/",function(req, res){
  res.render("home");
 });

//==============================================================USER route================================================//


//==============================================================signup route================================================//

router.get("/register", function(req, res){
  res.render("campground/register");
});




router.post("/register",function(req,res){
  var newUser = new User({username:req.body.username, email:req.body.email});
  var password = req.body.password;
  User.register(newUser, password, function(err, user){
    if(err){
      console.log(err);
      return res.render("campground/register");
    } else{
       passport.authenticate("local")(req, res, function(){
       req.flash("success", "Successfully Signed Up! Nice to meet you " + req.body.username);
       res.redirect("/campgrounds");
    });
    }
  });
});


//==============================================================login route================================================//

router.get("/login",function(req, res){
  res.render("campground/login");
});


router.post("/login", passport.authenticate("local",{
  successRedirect:"/campgrounds",
  failureRedirect:"/login"
}), function(req,res){
});

//==============================================================logout route================================================//

router.get("/logout",function(req,res){
    req.logout();
    res.redirect("/campgrounds");
});

//==============================================================middleware================================================//

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }else{
    res.redirect("/login");
  }
}


//==========================================================forgot password================================================//

// forgot password
router.get('/forgot', function(req, res) {
  res.render('forgot');
});


router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'chiragprajapati781@gmail.com',
          pass: process.env.GMAILPASSWORD
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'chiragprajapati781@gmail.com',
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'https://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});



//==============================token=======================//


router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'chiragprajapati781@gmail.com',
          pass: process.env.GMAILPASSWORD
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'chiragprajapati781@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' for https://' + req.headers.host + ' site has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/campgrounds');
  });
});






module.exports = router;

