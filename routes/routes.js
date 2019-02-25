// Routes

// Dependencies
// =============================================================
// const path = require("path");
const db = require("../models");

// Our scraping tools
const axios = require("axios");
const cheerio = require("cheerio");

// Routes
// =============================================================
module.exports = function (app) {

    // Our index route
    app.get("/", function (req, res) {

        db.Article.find({}).sort({ dateStamp: -1 }).limit(5).exec(function (err, data) {
            if (err) {
                console.log(err);
            } else {
                let allArticles = {
                    articles: data
                }
                res.render("index", allArticles)
            }
        })

    })

    // A GET route for scraping our website
    app.get("/scrape", function (req, res) {
        // First, we grab the body of the html with axios
        axios.get("https://www.theatlantic.com/latest/").then(function (response) {
            // Then, we load that into cheerio and save it to $ for a shorthand selector
            const $ = cheerio.load(response.data);

            // Now, we grab every h2 within an article tag, and do the following:
            $("li.article").each(function (i, element) {

                const result = {};

                result.title = $(this)
                    .children("a")
                    .children("h2")
                    .text();
                result.link = "https://www.theatlantic.com" + $(this)
                    .children("a")
                    .attr("href");
                result.summary = $(this)
                    .children("p")
                    .text();
                result.dateStamp = $(this)
                    .children("ul")
                    .children("li.date")
                    .children("time")
                    .attr("datetime");
                result.byline = $(this)
                    .children("ul")
                    .children("li.byline")
                    .children("a")
                    .attr("title");

                //Checks if this result is already in our db
                let hasBeenScraped = false;

                db.Article.find({ link: result.link })
                    .then(function (dbRes) {
                        hasBeenScraped = true;
                        console.log("we already have this one.");
                    })
                    .catch(function (err) {
                        console.log(err);
                    })

                if (!hasBeenScraped) {
                    db.Article.create(result)
                        .then(function (dbArticle) {
                            // View the added result in the console
                            console.log(dbArticle);
                        })
                        .catch(function (err) {
                            // If an error occurred, log it
                            console.log(err);
                        });
                }
            });

            // Send a message to the client
            res.redirect("/")
        });
    });

    // Route for getting all Articles from the db
    app.get("/articles", function (req, res) {

        db.Article.find({}, function (err, data) {
            if (err) {
                console.log(err);
            } else {
                res.json(data);
            }
        })

    });

    // Route for grabbing a specific Article by id, populate it with it's note
    app.get("/articles/:id", function (req, res) {

        db.Article.findById(req.params.id)
            .populate("note")
            .then(function (dbLib) {
                res.json(dbLib);
            })
            .catch(function (err) {
                res.json(err);
            })

    });

    // Route for saving/updating an Article's associated Note
    app.post("/articles/:id", function (req, res) {

        db.Note.create(req.body)
            .then(function (dbNote) {
                return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { note: dbNote._id } }, { new: true })
            })
            .then(function (dbArticle) {
                res.json(dbArticle);
            })
            .catch(function (err) {
                res.json(err);
            })
    });

    app.delete("/articles/:id", function (req, res) {
        db.Note.findByIdAndRemove(req.params.id, function (err) {
            if (err) return next(err);
            res.send('Deleted successfully!');
        })
    })

    app.get("/articles/range/:id", function (req, res) {

        const skipRange = parseInt(req.params.id);

        db.Article.find({}).sort({ dateStamp: -1 }).limit(5).skip(skipRange).exec(function (err, data) {
            if (err) {
                console.log(err);
            } else {
                let allArticles = {
                    articles: data,
                    range: skipRange
                }
                res.render("index", allArticles)
            }
        })

    })

}