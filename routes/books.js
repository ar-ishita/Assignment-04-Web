var express = require("express");
var router = express.Router();
var path = require("path");
var fs = require("fs").promises;
var Bookset = require("../models/book-set"); // Assuming you have a Bookset model defined

router.get("/detail", async (req, res) => {
  try {
    // Define the path to the JSON file in the public folder
    const filePath = path.join(__dirname, "../public", "dataset.json");

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
router.get("/bookset", (req, res) => {
  Bookset.find()
    .exec()
    .then((booksets) => {
      if (!booksets) {
        return res.status(404).json({ message: "No booksets found" });
      }

      // Format JSON output with indentation
      const formattedBooksets = JSON.stringify(booksets, null, 2);
      res.type("json").send(formattedBooksets);

      // Add a return statement here
      return;
    })
    .catch((err) => {
      console.error("Error in /bookset route:", err);
      res.status(500).send("Internal Server Error");
    });
});

router.get("/booksetisbn", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "GetBookSetISBN.html"));
});

// get a book with ISBN
router.post("/booksetisbn", (req, res) => {
  const isbn = req.body.ISBN;

  Bookset.find({ ISBN: isbn })
    .exec()
    .then((bookset) => {
      if (!bookset) {
        return res.status(404).json({ message: "book not found" });
      }

      //res.json(bookset);
      const formattedBookSet = JSON.stringify(bookset, null, 2);
      res.type("json").send(formattedBookSet);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal Server Error");
    });
});

router.get("/booksetadd", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "AddBookSet.html"));
});

//post
router.post("/booksetadd", (req, res) => {
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
          //res.json(book);
          res.send("Successfully! BookSet Record Added");
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

router.get("/updatebooksetisbn", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "UpdateBookSet.html"));
});

//put isbn
router.post("/updatebooksetisbn", (req, res) => {
  let isbn = req.body.ISBN;
  console.log("ISBN : ", isbn);
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

router.get("/booksetdeleteisbn", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "DeleteBookSetID.html"));
});

// delete a bookset by isbn
router.post("/booksetdeleteisbn", (req, res) => {
  let isbn = req.body.id;

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
router.get("/booksetsort", (req, res) => {
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

//categories
router.get("/categories", (req, res) => {
  Bookset.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
  ])
    .exec()
    .then((categoryCounts) => {
      if (!categoryCounts || categoryCounts.length === 0) {
        return res.status(404).json({ message: "No categories found" });
      }

      //res.json(categoryCounts);
      const formattedEmployees = JSON.stringify(categoryCounts, null, 2);
      res.type("json").send(formattedEmployees);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal Server Error");
    });
});

module.exports = router;
