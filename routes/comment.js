var express    = require('express');
var router     = express.Router();
var Campground = require("../models/campground");
var Comment    = require("../models/comment"); 

//==============================================================Commemts route================================================//


router.get("/campgrounds/:id/comments/new", isLoggedIn ,function(req,res){
   Campground.findById(req.params.id,function(err,campground){
    if(err){
      console.log(err)
    } else{
       res.render("comments/new",{campground:campground});
    }
  });
});


//========================================================Commemts post route================================================//


router.post("/campgrounds/:id/comments", isLoggedIn ,function(req,res){
   Campground.findById(req.params.id,function(err,campground){
    if(err){
      console.log(err)
    } else{
      Comment.create(req.body.comment,function(err,comment){
        if(err){
          console.log(err)
        } else{
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          comment.save();
          campground.comments.push(comment);
          campground.save();
          res.redirect("/campgrounds/" + campground._id);
        }
      });
       
    }
  });
});

//=============================================================middle ware================================================//


function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }else{
    res.redirect("/login");
  }
}

module.exports = router;


