var fs = require("fs").promises;
var path = require("path");
var express = require("express");
const { query } = require("express");
var mongoose = require("mongoose");
var app = express();
var database = require("./config/newDatabase");
var bodyParser = require("body-parser"); // pull information from HTML POST (express4)

var port = process.env.PORT || 8000;
app.use(bodyParser.urlencoded({ extended: "true" })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: "application/vnd.api+json" })); // parse application/vnd.api+json as json

mongoose.connect(database.url);

var Bookset = require("./models/book-set");

app.get("/", function (req, res) {
  res.render("index", { title: "Express" });
});

app.get("/api/book/detail", async (req, res) => {
  try {
    // Define the path to the JSON file in the public folder
    const filePath = path.join(__dirname, "public", "dataset.json");

    // Read the contents of the JSON file using promises
    const data = await fs.readFile(filePath, "utf8");

    // Parse the JSON data
    const jsonData = JSON.parse(data);

    /*// Save each book in the array to MongoDB
    for (const bookData of jsonData) {
      const book = new Bookset(bookData);
      await book.save();
    }*/
    await Bookset.insertMany(jsonData);

    res.status(200).send("Data imported successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

//get all bookset data from db
app.get("/api/bookset", (req, res) => {
  Bookset.find()
    .exec()
    .then((booksets) => {
      // Format JSON output with indentation
      const formattedEmployees = JSON.stringify(booksets, null, 2);
      res.type("json").send(formattedEmployees);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal Server Error");
    });
});

// get a bookset with ID of 1
app.get("/api/booksetid/:bookset_id", (req, res) => {
  const id = req.params.bookset_id;

  Bookset.findById(id)
    .exec()
    .then((booksets) => {
      if (!booksets) {
        return res.status(404).json({ message: "Book ID  not found" });
      }

      res.json(booksets);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal Server Error");
    });
});

// get a book with ISBN
app.get("/api/bookset/:bookset_isbn", (req, res) => {
  const isbn = req.params.bookset_isbn;

  Bookset.find({ ISBN: isbn })
    .exec()
    .then((bookset) => {
      if (!bookset) {
        return res.status(404).json({ message: "book not found" });
      }

      res.json(bookset);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal Server Error");
    });
});

//post
app.post("/api/bookset", (req, res) => {
  const newBookset = new Bookset({
    ISBN: req.body.ISBN,
    img: req.body.img,
    title: req.body.title,
    author: req.body.author,
    inventory: req.body.inventory,
    category: req.body.category,
  });

  // Save the new employee record
  newBookset
    .save()
    .then(() => {
      // Get and return all employees after the new employee record is created
      Bookset.find()
        .exec()
        .then((book) => {
          res.json(book);
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send("Internal Server Error");
        });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal Server Error");
    });
});

//put id
app.put("/api/bookset/:bookset_id", (req, res) => {
  let id = req.params.bookset_id;

  // Extract data from request body
  const data = {
    ISBN: req.body.ISBN,
    img: req.body.img,
    title: req.body.title,
    author: req.body.author,
    inventory: req.body.inventory,
    category: req.body.category,
  };

  // Update an existing record by isbn
  Bookset.findByIdAndUpdate(id, data, { new: true })
    .exec()
    .then((updatedBookSet) => {
      if (!updatedBookSet) {
        return res.status(404).json({ message: "BookSet not found" });
      }

      res.send("Successfully! BookSet updated");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal Server Error");
    });
});

//put isbn
app.put("/api/booksetisbn/:bookset_id", (req, res) => {
  let isbn = req.params.bookset_id;

  // Extract data from request body
  const data = {
    ISBN: req.body.ISBN,
    img: req.body.img,
    title: req.body.title,
    author: req.body.author,
    inventory: req.body.inventory,
    category: req.body.category,
  };

  // Update an existing record by isbn
  Bookset.findOneAndUpdate({ ISBN: isbn }, data, { new: true })
    .exec()
    .then((updatedBookSet) => {
      if (!updatedBookSet) {
        return res.status(404).json({ message: "BookSet not found" });
      }

      res.send("Successfully! BookSet updated");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal Server Error");
    });
});

// delete a bookset by id
app.delete("/api/bookset/:bookset_id", (req, res) => {
  let id = req.params.bookset_id;

  // Delete an bookset by ID
  Bookset.deleteOne({ _id: id })
    .exec()
    .then((result) => {
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Book not found" });
      }

      res.send("Successfully! Bookset has been Deleted.");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal Server Error");
    });
});

// delete a bookset by isbn
app.delete("/api/booksetisbn/:bookset_isbn", (req, res) => {
  let isbn = req.params.bookset_isbn;

  // Delete an bookset by ID
  Bookset.deleteOne({ ISBN: isbn })
    .exec()
    .then((result) => {
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Book not found" });
      }

      res.send("Successfully! Bookset has been Deleted.");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal Server Error");
    });
});

// get all bookset data from db with sorting - author, title but by default it will be author
app.get("/api/booksetsort", (req, res) => {
  // Get the sort parameter from the query string
  const sortBy = req.query.sortBy || "author"; // default to sorting by author

  // Define the sort criteria
  const sortValue = {};
  sortValue[sortBy] = 1; // 1 for ascending order, -1 for descending order

  Bookset.find()
    .sort(sortValue)
    .exec()
    .then((booksets) => {
      const formattedBooksets = JSON.stringify(booksets, null, 2);
      res.type("json").send(formattedBooksets);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal Server Error");
    });
});

//get all authors
app.get("/api/booksetgroup/:bookset_category", (req, res) => {
  const categorys = req.params.bookset_category;

  Bookset.find({ category: categorys })
    .exec()
    .then((bookset) => {
      if (!bookset) {
        return res.status(404).json({ message: "book not found" });
      }

      res.json(bookset);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal Server Error");
    });
});

//get all categories
// get all unique categories
app.get("/api/categories", (req, res) => {
  Bookset.find()
    .distinct("category")
    .exec()
    .then((categories) => {
      if (!categories || categories.length === 0) {
        return res.status(404).json({ message: "No categories found" });
      }

      res.json(categories);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal Server Error");
    });
});

app.listen(port, () => {
  console.log("App listening on port: " + port);
});
