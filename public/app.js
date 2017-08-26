// var mongoose = require("mongoose");
// var db = mongoose.connection;
// ********** Can't do this in browser

// Grab the articles as a json
$.getJSON("/articles", function(data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    var articles = [];
    articles.push("<img class='photo' src=" + data[i].image + " >");
    articles.push("<h2 data-id=" + data[i]._id + ">" + data[i].title + "</h2>");
    articles.push("<h3>" + data[i].date + "</p>");
    articles.push("<p>" + data[i].brief + " <a href=" + data[i].link + " target='_blank'>Keep Reading</a></p>");
    
    if(data[i].notes.length>0){
      for (var j = 0; j < data[i].notes.length; j++) {
        noteId = data[i].notes[j]
        
        articles.push("<p>Need to setup route to get note #"+noteId+"</p>")

        // thisNote = db.notes.find( { _id: {noteId} }) --- need to create route in server.js

        // console.log(thisNote)

        // articles.push("<h3>" + data[i].notes[j].title + "</h3>");
        // articles.push("<p>" + data[i].notes[j].body + "</p>");
        // articles.push("<button id='remove'>Remove Note</button>");

      }
    }
    
    $("#articles").append(articles);


  }
});


// Whenever someone clicks an h2 tag
$(document).on("click", "h2", function() {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .done(function(data) {
      console.log(data);
      // The title of the article
      $("#notes").append("<h3>" + data.title + "</h3>");
      // An input to enter a new title
      $("#notes").append("<input id='titleinput' name='title' placeholder='Title'>");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body' placeholder='Note'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      // If there's a note in the article
      
    });
});

$(document).on("click", "#update", function() {
  console.log("updating")
  $.ajax({
    method: "GET",
    url: "/update"
  })
    .done(function() {
      location.reload();
  })
      
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});
