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
  console.log("Server is running on port 3456");
});

const rowDataToJson = data => Object.values(JSON.parse(JSON.stringify(data)));

// get
const selectSQL = {
  department: "SELECT * FROM DEPARTMENT",
  employee: "SELECT * FROM EMPLOYEE",
  employeeJoinViaDeptId: `SELECT E.ID, E.NAME, E.SALARY,E.DEPT_ID, D.LOCATION,D.NAME AS DEPARTMENT_NAME
  FROM EMPLOYEE  E
  INNER JOIN DEPARTMENT D
  ON E.DEPT_ID = D.DEPT_ID
  ORDER BY ID`
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
  const { dept_id } = req.query;
  let query = selectSQL.employee;
  if (dept_id) {
    query = selectSQL.employeeJoinViaDeptId;
  }
  getDataFromSQL({ query })
    .then(result => {
      if (dept_id) {
        const list = result.filter(i => i.DEPT_ID === parseInt(dept_id));
        return res.json(list);
      }
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
