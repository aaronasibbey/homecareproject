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

app.get('/patientInfo', (req, res)=> {
  //TODO: add database call
  const data = {
    name: "John Snow",
    dob: "01/01/2000",
    visits: [
      {
        nurse: "Jan Smith",
        date: "11/01/2022",
        time: "Morning",
        notes: "Seemed happy, took medication. Discussed how their weekend went."
      },
      {
        nurse: "Jan Smith",
        date: "11/01/2022",
        time: "Evening",
        notes: "Consistent mood with morning, but noticably fatigued. Night medication was taken."
      }
    ],
    medication: [
      {
        name: "Scary Drug Name",
        dose: "30mg",
        frequency: "Twice Daily",
      },
      {
        name: "Youth Serum",
        dose: "5000mg",
        frequency: "Once in morning",
      },
      {
        name: "Happy pills",
        dose: "20mg",
        frequency: "As needed"
      }
    ]
  }
  res.render("pages/patientInfo", {data}); 
});