// Whenever someone clicks a li tag
$(document).on("click", ".article-wrap", function () {
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
      .then(function (data) {
        $("#notes").append("<h2 class='note-title'>Comments for '" + data.title + "'</h2>");
  
        let newForm = $("<form>")
  
        newForm.append("<label for='bodyinput'>New Comment</label>")
        newForm.append("<textarea class='form-control' id='bodyinput' rows='3'></textarea>")
        newForm.append("<button data-id='" + data._id + "' id='savenote' class='btn btn-success'>Save Note</button>");
      
        $("#notes").append(newForm);
        $("#notes").append("<hr>")
  
        for (let i = 0; i < data.note.length; i++) {
    
          let newCard = $("<div>")
            .addClass("card")
            .addClass("article-comment");
  
          let newCardBody = $("<div>")
            .addClass("card-body");
          
          let newCardTitle = $("<h5>")
            .addClass("card-title")
            .text(data.note[i].title);
  
          let newCardText = $("<p>")
            .addClass("card-text")
            .text(data.note[i].body);
  
          let newCardBtn = $("<button>")
            .addClass("card-link")
            .addClass("note-btn")
            .addClass("btn")
            .addClass("btn-warning")
            .attr("data-id", data.note[i]._id)
            .text("Delete");
  
          newCardBody.append(newCardTitle, newCardText, newCardBtn);
  
          newCard.append(newCardBody);
          
          $("#notes").append(newCard);
        }
      });
  });
  
  // When you click the savenote button
  $(document).on("click", "#savenote", function () {
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
      .then(function (data) {
        // Log the response
        console.log(data);
        // Empty the notes section
        $("#notes").empty();
      });
  
    // Also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
  });
  
  $(document).on("click", ".note-btn", function () {
    console.log("Delete!");
    const thisId = $(this).attr("data-id");
    $.ajax({
      method: "DELETE",
      url: "/articles/" + thisId
    })
      // With that done, add the note information to the page
      .then(function (data) {
        $("#notes").empty();
      });
  })
  
  // if (articleRange > 0) {
  //   $("#articles").append("<a href=/articles/range/" + (articleRange - 5) + ">Back</a>")
  // }
  
  // $("#articles").append("<button id='next-5' class='btn'>Next 5</button>");
  
  // $("#articles").append("<a href='/' id='next-5'>Next 5</a>");
  
  $(document).on("click", "#next-5", function () {
    event.preventDefault();
    let articleRange = $("#next-5").attr("data-id");
  
    articleRange = +articleRange + 5;
  
    location.assign("/articles/range/" + articleRange)
  })
  
  $(document).on("click", "#back-5", function () {
    event.preventDefault();
    let articleRange = $("#back-5").attr("data-id");
  
    articleRange = +articleRange - 5;
  
    location.assign("/articles/range/" + articleRange)
  })