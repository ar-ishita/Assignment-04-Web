var express = require("express");
var mongoose = require("mongoose");
var app = express();
var database = require("./config/database");
var bodyParser = require("body-parser"); // pull information from HTML POST (express4)

var port = process.env.PORT || 8000;
app.use(bodyParser.urlencoded({ extended: "true" })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: "application/vnd.api+json" })); // parse application/vnd.api+json as json

mongoose.connect(database.url);

var Employee = require("./models/employee");

//get all employee data from db
app.get("/api/employees", (req, res) => {
  Employee.find()
    .exec()
    .then((employees) => {
      // Format JSON output with indentation
      const formattedEmployees = JSON.stringify(employees, null, 2);
      res.type("json").send(formattedEmployees);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal Server Error");
    });
});

// get a employee with ID of 1
app.get("/api/employees/:employee_id", (req, res) => {
  const id = req.params.employee_id;

  Employee.findById(id)
    .exec()
    .then((employee) => {
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      res.json(employee);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal Server Error");
    });
});

// create employee and send back all employees after creation
/*app.post("/api/employees", function (req, res) {
  // create mongose method to create a new record into collection
  console.log(req.body);

  Employee.create(
    {
      name: req.body.name,
      salary: req.body.salary,
      age: req.body.age,
    },
    function (err, employee) {
      if (err) res.send(err);

      // get and return all the employees after newly created employe record
      Employee.find(function (err, employees) {
        if (err) res.send(err);
        res.json(employees);
      });
    }
  );
});*/

app.post("/api/employees", (req, res) => {
  const newEmployee = new Employee({
    name: req.body.name,
    salary: req.body.salary,
    age: req.body.age,
  });

  // Save the new employee record
  newEmployee
    .save()
    .then(() => {
      // Get and return all employees after the new employee record is created
      Employee.find()
        .exec()
        .then((employees) => {
          res.json(employees);
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
// create employee and send back all employees after creation
/*app.put("/api/employees/:employee_id", function (req, res) {
  // create mongose method to update an existing record into collection
  console.log(req.body);

  let id = req.params.employee_id;
  var data = {
    name: req.body.name,
    salary: req.body.salary,
    age: req.body.age,
  };

  // save the user
  Employee.findByIdAndUpdate(id, data, function (err, employee) {
    if (err) throw err;

    res.send("Successfully! Employee updated - " + employee.name);
  });
});*/

app.put("/api/employees/:employee_id", (req, res) => {
  let id = req.params.employee_id;

  // Extract data from request body
  const data = {
    name: req.body.name,
    salary: req.body.salary,
    age: req.body.age,
  };

  // Update an existing record by ID
  Employee.findByIdAndUpdate(id, data, { new: true })
    .exec()
    .then((updatedEmployee) => {
      if (!updatedEmployee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      res.send("Successfully! Employee updated - " + updatedEmployee.name);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal Server Error");
    });
});

// delete a employee by id
app.delete("/api/employees/:employee_id", (req, res) => {
  let id = req.params.employee_id;

  // Delete an employee by ID
  Employee.deleteOne({ _id: id })
    .exec()
    .then((result) => {
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: "Employee not found" });
      }

      res.send("Successfully! Employee has been Deleted.");
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal Server Error");
    });
});

app.listen(port);
console.log("App listening on port : " + port);
