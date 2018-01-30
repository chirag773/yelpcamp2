var mongoose = require('mongoose');
var Campground = require("./models/campground")
var Comment = require("./models/comment")
var data = [
   {
       name:"down the hill",
       image:"https://farm8.staticflickr.com/7268/7121859753_e7f787dc42.jpg", 
       description:"hill view"
  },
     {
       name:"best view",
       image:"https://farm2.staticflickr.com/1076/826745086_e1c145c054.jpg", 
       description:"hill view"
  },
     {
       name:"fire",
       image:"https://farm5.staticflickr.com/4496/36934455643_2e9eb1d50a.jpg", 
       description:"born fire"
  }
]

function seedDB(){
  Campground.remove({}, function(err){
  if(err){
    console.log(err)
  }
  console.log("remove campground")
    /////////adding campground///////////////
     
    data.forEach(function(seed){
        Campground.create(seed, function(err,campground){ 
      if(err){
        console.log(err)
      } else {
        console.log("campground added")
        
        ////// ////comments//////////////
        
          Comment.create(
          {
            text:"need more",
            author:"saurabh"
          },function(err,comment){
            if(err){
              console.log(err)
            } else{
              campground.comments.push(comment);
              campground.save();
            }
          });
      }
    }); 
});
  });
   
}

module.exports = seedDB;