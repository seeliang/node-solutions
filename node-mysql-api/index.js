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

api.get("/get/department", async (req, res, next) => {
  connection.connect();
  connection.query("SELECT * FROM `DEPARTMENT`", (error, results) => {
    if (error) throw error;
    let departmentData = Object.values(JSON.parse(JSON.stringify(results)));
    res.json(departmentData);
  });
  connection.end();
});
