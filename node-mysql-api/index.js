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

var bodyParser = require('body-parser')
api.use( bodyParser.json() );       // to support JSON-encoded bodies
api.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

api.listen(3456, () => {
  console.log("Server running on port 3456");
});

const rowDataToJson = data => Object.values(JSON.parse(JSON.stringify(data)));

const selectSQL = {
  department: "SELECT * FROM `DEPARTMENT`",
  employee: "SELECT * FROM `EMPLOYEE`"
};

const getDataFromSQL = ({ query }) =>
  new Promise((resolve, reject) => {
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
  getDataFromSQL({ query: selectSQL.employee })
    .then(result => {
      res.json(result);
    })
    .catch(error => console.log(error));
});

api.post('/post/employee',(req,res) => {
  console.log(req.body);
  res.send('POST request to employee success')
})