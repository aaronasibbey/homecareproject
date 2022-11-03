const express = require('express');
const app = express();
const pgp = require('pg-promise')();
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const axios = require('axios');

// database configuration
const dbConfig = {
    host: 'db',
    port: 5432,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
  };

const db = pgp(dbConfig);

// test database
db.connect()
.then(obj => {
    console.log('Database connection successful');
    obj.done(); // success, release the connection;
})
.catch(error => {
    console.log('ERROR:', error.message || error);
});

app.set('view engine', 'ejs');

app.use(bodyParser.json());

app.use(
    session({
      secret: process.env.SESSION_SECRET,
      saveUninitialized: false,
      resave: false,
    })
  );
  
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );

app.listen(3000);
console.log('Server is listening on port 3000');

app.get('/', (req, res) =>{
    res.redirect('/home');
  });

app.get('/home', (req, res) => {
    res.render("pages/home");
  });


// TODO: place authentication middleware and login methods PRIOR to nurse / patient portal pages

app.get('/nurse', (req, res) => {
  res.render("pages/nurse");
});

app.post('/selectpatient', (req,res) => {
  // TODO, for nurse patient update form
});

app.post('/patientupdate', (req,res) => {
  // TODO, for nurse patient update form
});