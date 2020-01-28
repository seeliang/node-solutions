var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  port: '8889',
  database: 'demo'
});
 
connection.connect();
 
connection.query('SELECT * FROM `DEPARTMENT`', function (error, results, fields) {
  if (error) throw error;
  console.log('The DEPARTMENT List`: ', results);
});
 
connection.end();