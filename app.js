const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");

const app = express();

mongoose.connect("mongodb://127.0.0.1:27017/myBlogDB") // connect mongoose
mongoose.set("strictQuery",false);
app.set('view engine', 'ejs'); //Set view engine to ejs
app.use(bodyParser.urlencoded({extended: true})); // Set body-parser
app.use(express.static("public")); // To use public file in server

//Setting up mongoose
const entrySchema = new mongoose.Schema({
    cityName: String,
    entryTitle: String,
    entry: String,
    imgDir: String,
    entryUrl: String
})
const Entry = mongoose.model("Entry", entrySchema)

//Setting storage options for multer
const storageEngine = multer.diskStorage({
    destination: "./public/images",
    filename: function(req,file,cb){
        cb(null,Date.now() + "--" + file.originalname);
    }
})

function checkFileType(file,cb){
    //Allowed extensions
    const fileTypes = /jpeg|jpg|png|gif|svg/;

    //Check extension
    const extName = fileTypes.test(path.extname(file.originalname));

    const mimeType = fileTypes.test(file.mimetype);

    if (mimeType && extName) {
        return cb(null,true);
    } 
    else {
        cb("Error: You can Only Upload Images!!");
    }
}

//Setting upload options for multer
const upload = multer({
    storage: storageEngine,
    limits:{ fileSize:10000000 },
    fileFilter: function(req,file,cb){
        checkFileType(file,cb)
    }
})

app.get("/",function(req,res){
    Entry.find(function(err,result){
        if (!err) {
            res.render("home", {entriesArray:result})
        }
    })
})

app.get("/cities",function(req,res){
    Entry.find(function(err,result){
        if (!err) {
            res.render("cities", {entriesArray:result})
        }
    })
})

app.get("/who-am-i",function(req,res){
    res.render("who_am_i")
})

app.get("/contact-me",function(req,res){
    res.render("contact_me")
})

app.get("/entries/:entry_title",function(req,res){
    let cityName = _.startCase(req.params.entry_title)
    Entry.findOne({cityName: cityName},function(err,result){
        if (!err) {
            let entryTitle = result.entryTitle
            let entry = String(result.entry)
            let entryLength = entry.length
            let entryPart1 = entry.substr(0,Math.round(entryLength/2))
            let entryPart2 = entry.substr(entryLength/2 + 1)
            let imgDir = result.imgDir
            let entryUrl = result.entryUrl
            res.render("entry", {cityName: cityName, entryTitle:entryTitle, entryPart1:entryPart1,entryPart2:entryPart2,imgDir:imgDir, entryUrl:entryUrl})
        }
})
})
app.get("/compose",function(req,res){
res.render("compose")
})

app.post("/compose",upload.single("image"),function(req,res){
    if(req.file){
        var entry = new Entry({
            cityName: req.body.cityTitleText,
            entryTitle: req.body.entryTitleText,
            entry: req.body.postText,
            imgDir: "/images/" + req.file.filename,
            entryUrl: "/entries/"+_.kebabCase(req.body.cityTitleText)
          })
          entry.save(function(err,result){
            if (!err) {
              res.redirect("/")
            }
          })
    }
    else{
        var entry = new Entry({
            cityName: req.body.cityTitleText,
            entryTitle: req.body.entryTitleText,
            entry: req.body.postText,
            imgDir: "/images/italy.jpg",
            entryUrl: "/entries/"+_.kebabCase(req.body.cityTitleText)
          })
          entry.save(function(err,result){
            if (!err) {
              res.redirect("/")
            }
          })
    }
    
})
app.listen(3000, function() {
    console.log("Server started on port 3000");
  });