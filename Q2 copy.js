const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs").promises;
const path = require("path");
const app = express();
const database = require("./config/database");
const bodyParser = require("body-parser");

const port = process.env.PORT || 8000;

app.use(bodyParser.urlencoded({ extended: "true" }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));

mongoose.connect(database.url);

const Employee = require("./models/book-set");

// Your existing routes...

// New route to fetch data from JSON file
/*app.get("/api/book/details", (req, res) => {
  // Define the path to the JSON file in the public folder
  const filePath = path.join(__dirname, "public", "dataset.json");

  // Read the contents of the JSON file
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
      return;
    }

    try {
      // Parse the JSON data
      const jsonData = JSON.parse(data);

      // Send the JSON response
      res.json(jsonData);
    } catch (parseError) {
      console.error(parseError);
      res.status(500).send("Error parsing JSON");
    }
  });
});*/

app.get("/api/book/detail", (req, res) => {
  // Define the path to the JSON file in the public folder
  const filePath = path.join(__dirname, "public", "dataset.json");

  // Read the contents of the JSON file using promises
  fs.readFile(filePath, "utf8")
    .then((data) => {
      // Parse the JSON data
      const jsonData = JSON.parse(data);
      const formattedBookSet = JSON.stringify(jsonData, null, 2);
      res.type("json").send(formattedBookSet);
      // Send the JSON response
      //res.json(jsonData);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal Server Error");
    });
});

app.listen(port, () => {
  console.log("App listening on port: " + port);
});
