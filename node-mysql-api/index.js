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

api.listen(3456, () => {
  console.log("Server running on port 3456");
});

const rowDataToJson = data => Object.values(JSON.parse(JSON.stringify(data)));

const selectSQL = {
  department: "SELECT * FROM `DEPARTMENT`"
};

const getDataFromSQL = ({ query }) =>
  new Promise(function(resolve, reject) {
    connection.connect();
    connection.query(query, (error, results) => {
      if (error) return reject(error);
      resolve(rowDataToJson(results));
    });
    connection.end();
  });

api.get("/get/department", (req, res) => {
  getDataFromSQL({ query: selectSQL.department}).then(result => {
    res.json(result)
  }).catch(error => console.log(error));
});
