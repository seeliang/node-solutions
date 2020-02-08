const express = require('express');
const mysql = require('mysql');

const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: 'root',
  port: '8889',
  database: 'demo',
});

const api = express();

const bodyParser = require('body-parser');

api.use(bodyParser.json()); // to support JSON-encoded bodies
api.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true,
  }),
);

api.listen(3456, () => {
  console.log('Server is running on port 3456');
});

const rowDataToJson = (data) => Object.values(JSON.parse(JSON.stringify(data)));

// get
const selectSQL = {
  department: 'SELECT * FROM DEPARTMENT',
  employee: 'SELECT * FROM EMPLOYEE',
  employeeJoinViaDeptId: `SELECT E.ID, E.NAME, E.SALARY,E.DEPT_ID, D.LOCATION,D.NAME AS DEPARTMENT_NAME
  FROM EMPLOYEE  E
  INNER JOIN DEPARTMENT D
  ON E.DEPT_ID = D.DEPT_ID
  ORDER BY ID`,
};

const getDataFromSQL = ({ query }) => new Promise((resolve, reject) => {
  pool.query(query, (error, results) => {
    if (error) return reject(error);
    return resolve(rowDataToJson(results));
  });
});

api.get('/get/department', (req, res) => {
  getDataFromSQL({ query: selectSQL.department })
    .then((result) => {
      res.json(result);
    })
    .catch((error) => console.log(error));
});

api.get('/get/employee', (req, res) => {
  const { deptId } = req.query;
  let query = selectSQL.employee;
  if (deptId) {
    query = selectSQL.employeeJoinViaDeptId;
  }
  getDataFromSQL({ query })
    .then((result) => {
      if (deptId) {
        const list = result.filter((i) => i.DEPT_ID === parseInt(deptId, 10));
        return res.json(list);
      }
      return res.json(result);
    })
    .catch((error) => console.log(error));
});

// post
const insertSQL = {
  employee: 'INSERT INTO EMPLOYEE SET ?',
};

const postDataToSQL = ({ query, data }) => new Promise((resolve, reject) => {
  pool.query(query, data, (error, results) => {
    if (error) return reject(error);
    return resolve(results);
  });
});

api.post('/post/employee', (req, res) => {
  const data = req.body;
  postDataToSQL({ query: insertSQL.employee, data })
    .then(() => {
      res.send('POST request to employee success');
    })
    .catch((error) => console.log(error));
});
