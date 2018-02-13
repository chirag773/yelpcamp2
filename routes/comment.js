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


//========================================================Commemts delete route================================================//




router.delete("/campgrounds/:id/comments/:comment_id",correctUser,function(req,res){
  Comment.findByIdAndRemove(req.params.comment_id, function(err){
     if(err){
    console.log(err)
} else{
res.redirect("/campgrounds/" + req.params.id);
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



function correctUser(req,res,next){
  if(req.isAuthenticated()){
      Comment.findById(req.params.comment_id, function(err,foundComment){
        if(err){
      res.redirect("back");
    } else{
      //if its owner
      if(foundComment.author.id.equals(req.user._id)){
//             res.render("campground/edit",{campground:foundCampground})
        next();
      }else{
        res.redirect("back");
      }

    }
     });
  }else{
    res.send("you are not a author of this so can't delete this please go back")
  }
}

module.exports = router;


