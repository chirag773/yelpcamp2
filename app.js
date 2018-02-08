var express        = require('express');
var app            = express();
var bodyParser     = require('body-parser');
var mongoose       = require('mongoose');
var passport       = require('passport');
var LocalStrategy  = require('passport-local');
var Campground     = require("./models/campground");
var Comment        = require("./models/comment") ;
var User           = require("./models/user");
var seedDB         = require("./seeds");

seedDB();
mongoose.connect("mongodb://localhost/yelp_camp");

app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended: true}));

///////////////////////passpport config////////////////////////////////////////////////////
app.use(require("express-session")({
  secret:"THIS IS SECRET",
  resave:false,
  saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function(req,res,next){
  res.locals.currentUser = req.user;
  next();
}); 


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
      res.render("campground/campgrounds",{campgrounds: dbCampground,currentUser:req.user});
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
  res.render("campground/new");
});





///////////////////////////////show////////////////////////////////////////////////

app.get("/campgrounds/:id",function(req, res){
  Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
    if(err){
      console.log(err)
    } else{
      console.log(foundCampground)
       res.render("campground/show",{campground:foundCampground});
    }
  });
});



// =========================
//  comments
// ========================

app.get("/campgrounds/:id/comments/new", isLoggedIn ,function(req,res){
   Campground.findById(req.params.id,function(err,campground){
    if(err){
      console.log(err)
    } else{
       res.render("comments/new",{campground:campground});
    }
  });
});


// /////////////////////////////////comment post routes////////////////////


app.post("/campgrounds/:id/comments", isLoggedIn ,function(req,res){
   Campground.findById(req.params.id,function(err,campground){
    if(err){
      console.log(err)
    } else{
      Comment.create(req.body.comment,function(err,comment){
        if(err){
          console.log(err)
        } else{
          campground.comments.push(comment);
          campground.save();
          res.redirect("/campgrounds/" + campground._id);
        }
      });
       
    }
  });
});

///========================
/// user
///========================

// //////////////sign up////////////////////////////////////////////////////

app.get("/register", function(req, res){
  res.render("campground/register");
});




app.post("/register",function(req,res){
  var newUser = new User({username:req.body.username});
  var password = req.body.password; 
  User.register(newUser, password, function(err, user){
    if(err){
      console.log(err);
      return res.render("campground/register");
    } else{
       passport.authenticate("local")(req, res, function(){
       res.redirect("/campgrounds");
    });
    }
  });
});


///////////////////////////////log in ////////////////////////////////////

app.get("/login",function(req, res){
  res.render("campground/login");
});


app.post("/login", passport.authenticate("local",{
  successRedirect:"/campgrounds",
  failureRedirect:"/login"
}), function(req,res){
});

////////////////////////logout/////////////////////

app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/campgrounds");
});

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }else{
    res.redirect("/login");
  }
}








app.listen(3000, function () {
  console.log('Server started at port 3000');
});