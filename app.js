var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
mongoose.connect("mongodb://localhost/yelp_camp");

app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended: true}));

// ///////////////////////////////schema setup///////////////////////////////////////////

var campgroundSchema = new mongoose.Schema({
  name:String,
  image:String,
  description:String
});

var Campground = mongoose.model("Campground", campgroundSchema);

//////////////////////////////////home page//////////////////////////////////////////////////////// 
app.get("/",function(req, res){
  res.render("home");
 });

/////////////////////////////////////////display campground//////////////////////////////////////////////////
app.get("/campgrounds",function(req, res){
//   getting info from db
  Campground.find({},function(err, dbCampground){
    if(err){
      console.log(err);
    }else{
      res.render("campgrounds",{campgrounds: dbCampground});
    }
  });  
});

/////////////////////////////////////post rout///////////////////////////////////////////////
app.post("/campgrounds",function(req, res){
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


//////////////////////////////////////////////new camp grpund form////////////////////////////////


app.get("/campgrounds/new",function(req, res){
  res.render("new");
});


///////////////////////////////show////////////////////////////////////////////////

app.get("/campgrounds/:id",function(req, res){
  Campground.findById(req.params.id,function(err,foundCampground){
    if(err){
      console.log(err)
    } else{
       res.render("show",{campground:foundCampground});
    }
  });
});



app.listen(3000, function () {
  console.log('Server started at port 3000');
});