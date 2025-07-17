
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200
}));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '98154022.Ali',
  database: 'gamemarket'  
});

db.connect(error => {
  if (error) {
    console.error(error);
  } else {
    console.log('Connected to the database');
  }
});

const query=(q,arr,res) =>{
    db.query(
        q,
        arr,
        (error, data) => {
          if (error) {
            console.log(error);
          } else {
          //   response.status(201).json({
          //     message: `Inserted ${result.affectedRows} row(s)`,
          //   });
            res.json(data);
            console.log(data);
          }
        }
      );
}

app.post('/register', (req, res) => {
  // const firstName = request.body.first_name;
  const id = req.body.id;
  const first_name =req.body.firstName ;
  const last_name = req.body.lastName;
  const email = req.body.email;
  const pass = req.body.password;
  console.log(id,first_name,last_name,email,pass);
  db.query("SELECT * FROM customers WHERE email = ?",[email],(err,results)=>{
    if(err) throw err;
    if(results.length){
      console.log("done before");
      res.json("done before.");
    }else{
      const q = 'INSERT INTO customers (id, first_name, last_name, email, pass) VALUES (? ,? , ? ,? , ?)';
      const arr = [id, first_name, last_name, email, pass];
      query(q,arr,res);
    }
  })
  
});
