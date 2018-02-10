var express    = require('express');
var router     = express.Router();   
var Campground = require("../models/campground");

//============================================================campground get route================================================//

router.get("/campgrounds",function(req, res){
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
router.post("/campgrounds",function(req, res){
  var name = req.body.name;
  var image = req.body.image;
  var description = req.body.description
  var newCampground ={name: name,image: image, description:description};
  Campground.create(newCampground,function(err, newlyCampground){
    if(err){
      console.log(err);
    }else{
       res.redirect("/campgrounds");
    }
  });
});


//==============================================================new camp grpund form================================================//


router.get("/campgrounds/new",function(req, res){
  res.render("campground/new");
});





//==============================================================showcamp grpund ==================================================//

router.get("/campgrounds/:id",function(req, res){
  Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
    if(err){
      console.log(err)
    } else{
      console.log(foundCampground)
       res.render("campground/show",{campground:foundCampground});
    }
  });
});

module.exports = router;
