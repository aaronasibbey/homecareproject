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

app.use(express.static( 'public' ) );

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

app.get('/login', (req, res) => {
    res.render("pages/login");
  });

app.get('/register', (req, res) => {
    res.render("pages/register");
  });


// TODO: place authentication middleware and login methods PRIOR to nurse / patient portal pages

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
})

// global variable for the nurse's currently selected patient
let currentPatientID = -1;

app.get('/nurse', (req, res) => {
  // TODO: require nurse perm level for viewing this page, else send a message that user has no access

  // const query = "select * from users";
  // db.one(query)
  //   .then((data) => {
  //     console.log(data);
  //   })
  //   .catch((err) => {
  //     console.log(err);
  //   });
  // TODO: database call to get info prior to render
  
  if (currentPatientID === -1) {
    currentPatientID = 1; 
    // TODO: this should default to the nurse's lowest patient id from db query call
  }

  // TODO load data for the patient with query based on currentPatientID field
  const data = {
    selected_id: `${currentPatientID}`,
    nurse_patients: [
      {
        patient_id: "1",
        patient_name: "John Snow"
      },
      {
        patient_id: "2",
        patient_name: "Jane Doe"
      }   
    ],
    patient_name: "John Snow",
    dob: "2012-04-23T18:25:43.511Z",
    patient_needs: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
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

  res.render("pages/nurse", {data});
});

app.post('/selectpatient', (req,res) => {
  let select_id = parseInt(req.body.selected_patient);
  console.log("Selected patient ID:");
  console.log(select_id);
  currentPatientID = select_id;
  res.redirect("/nurse");
});

app.post('/patientupdate', (req,res) => {
  // TODO, for nurse patient update form
});