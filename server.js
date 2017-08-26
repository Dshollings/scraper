// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");
var request = require("request");
var cheerio = require("cheerio");
mongoose.Promise = Promise;

var app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
mongoose.connect("mongodb://heroku_9hwgzl5f:qasjfhfdoin96t80gcq79hh8lj@ds139278.mlab.com:39278/heroku_9hwgzl5f");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});


// Routes
// ======

// A GET request to scrape the UT website's local news page
app.get("/update", function(req, res) {
  // html request
  request("http://www.sandiegouniontribune.com/communities/san-diego/", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // Now, we grab every article on the page:
    $(".trb_outfit_group_list_item").each(function(i, element) {
      
      var result = {};

      result.title = $(this).children(".trb_outfit_group_list_item_body").children("h3").text()
      result.date = $(this).children(".trb_outfit_group_list_item_body").children(".trb_outfit_group_item_label").children("span").attr("data-dt")
      result.link = "http://www.sandiegouniontribune.com/communities/san-diego/" + $(this).children("a").attr("href");
      result.image = $(this).children(".trb_outfit_group_list_item_figure").children("img").attr("data-baseurl");
      result.brief = $(this).children(".trb_outfit_group_list_item_body").children("p").text();

      // Using our Article model, create a new entry
      var entry = new Article(result);

      // Save entry to the db
      entry.save(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        // Or log the doc
        else {
          // console.log(doc);
        }
      });

    });
  });
});

// Get articles from mongoDB
app.get("/articles", function(req, res) {
  // Grab every doc in the Articles array
  Article.find({}, function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});

// Grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ "_id": req.params.id })
  // ..and populate all of the notes associated with it
  .populate("notes")
  // now, execute our query
  .exec(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise, send the doc to the browser as a json object
    else {
      res.json(doc);
    }
  });
});


// Create a new note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  var newNote = new Note(req.body);

  // And save the new note the db
  newNote.save(function(error, doc) {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise
    else {
      // Use the article id to push new note
      Article.findOneAndUpdate({ "_id": req.params.id }, { $push : {"notes": doc._id }})

      // Execute the above query
      .exec(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        else {
          // Or send the document to the browser
          res.send(doc);
        }
      });
    }
  });
});


// Listen on port 3030
var port = process.env.PORT || 3050;
app.listen(port, function() {
  console.log("App running on port 3050!");
});
