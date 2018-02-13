var express    = require('express');
var router     = express.Router();   
var Campground = require("../models/campground");

//============================================================campground get route================================================//

router.get("/campgrounds", isLoggedIn ,function(req, res){
//   getting info from db
  Campground.find({},function(err, dbCampground){
    if(err){
      console.log(err);
    }else{
      res.render("campground/campgrounds",{campgrounds: dbCampground,currentUser:req.user});
    }
  });  
});

//============================================================campground post route================================================//

router.post("/campgrounds", isLoggedIn, function(req, res){
  var name = req.body.name;
  var image = req.body.image;
  var description = req.body.description;
  var author = {
    id: req.user._id,
    username:req.user.username
  };
  var newCampground ={name: name,image: image, description:description, author:author};
  Campground.create(newCampground,function(err, newlyCampground){
    if(err){
      console.log(err);
    }else{
       res.redirect("/campgrounds");
    }
  });
});


//==============================================================new camp grpund form================================================//


router.get("/campgrounds/new",isLoggedIn,function(req, res){
  res.render("campground/new");
});





//==============================================================showcamp grpund ==================================================//

router.get("/campgrounds/:id",function(req, res){
  Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
    if(err){
      console.log(err)
    } else{
       res.render("campground/show",{campground:foundCampground});
    }
  });
});




// //=============================================================update get route================================================//

router.get("/campgrounds/:id/edit",correctUser,function(req, res){
   Campground.findById(req.params.id, function(err,foundCampground){
      if(err){
    console.log(err)
} else{
  res.render("campground/edit",{campground:foundCampground})
  
  }
   });
});


// //=============================================================update route================================================//

router.put("/campgrounds/:id",isLoggedIn, function(req, res){
  Campground.findByIdAndUpdate(req.params.id, req.body.campground ,function(err,updateCamground){
     if(err){
    console.log(err)
} else{
  res.redirect("/campgrounds/" + req.params.id);
  }
   });
});


// //=============================================================delete route================================================//

router.delete("/campgrounds/:id",correctUser,function(req,res){
  Campground.findByIdAndRemove(req.params.id, function(err){
     if(err){
    console.log(err)
} else{
  res.redirect("/campgrounds");
  }
   });
});


// //=============================================================middle ware================================================//


function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }else{
    res.redirect("/login");
  }
}

// //========================================================middleware for correctuser================================================//


function correctUser(req,res,next){
  if(req.isAuthenticated()){
      Campground.findById(req.params.id, function(err,foundCampground){
        if(err){
      res.redirect("back");
    } else{
      //if its owner
      if(foundCampground.author.id.equals(req.user._id)){
//             res.render("campground/edit",{campground:foundCampground})
        next();
      }else{
        res.redirect("back");
      }

    }
     });
  }else{
    res.redirect("/login");
  }
}

module.exports = router;
