const express = require("express");
var mysql = require("mysql");
var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  port: "8889",
  database: "demo"
});

const api = express();

var bodyParser = require("body-parser");
api.use(bodyParser.json()); // to support JSON-encoded bodies
api.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true
  })
);

api.listen(3456, () => {
  console.log("Server running on port 3456");
});

const rowDataToJson = data => Object.values(JSON.parse(JSON.stringify(data)));

// get
const selectSQL = {
  department: "SELECT * FROM `DEPARTMENT`",
  employee: "SELECT * FROM `EMPLOYEE`"
};

const getDataFromSQL = ({ query, req }) =>
  new Promise((resolve, reject) => {
    const id = req.query.dept_id;
    console.log(id)
    connection.query(query, (error, results) => {
      if (error) return reject(error);
      resolve(rowDataToJson(results));
    });
  });

api.get("/get/department", (req, res) => {
  getDataFromSQL({ query: selectSQL.department })
    .then(result => {
      res.json(result);
    })
    .catch(error => console.log(error));
});

api.get("/get/employee", (req, res) => {
  getDataFromSQL({ query: selectSQL.employee, req })
    .then(result => {
      res.json(result);
    })
    .catch(error => console.log(error));
});

// post
const insertSQL = {
  employee: "INSERT INTO EMPLOYEE SET ?"
};

const postDataToSQL = ({ query, data }) =>
  new Promise((resolve, result) => {
    connection.query(query, data, (error, results) => {
      if (error) return resolve(error);
      resolve(result);
    });
  });

api.post("/post/employee", (req, res) => {
  const data = req.body;
  postDataToSQL({ query: insertSQL.employee, data })
    .then(() => {
      res.send("POST request to employee success");
    })
    .catch(error => console.log(error));
});
