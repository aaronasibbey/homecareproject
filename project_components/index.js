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
app.get('/logout', (req, res) => {
    res.render("pages/logout")
});

app.get('/superuser', (req, res) => {
  res.render("pages/superuser")
});

// TODO: place authentication middleware and login methods PRIOR to nurse / patient portal pages

app.get('/patientInfo', (req, res)=> {
  const userid = 2;
  /*
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
  }*/
  

  const patientInfoQuery = `SELECT D.id, D.legal_name AS name, D.dob, to_json(T.visits) AS visits, to_json(U.medication) AS medication
  FROM
  (SELECT A.id, json_agg(
  json_build_object(
    'nurse', H.legal_name,
    'date', C.date,
    'notes', C.notes
  )
) AS visits
FROM users AS A LEFT JOIN patient_to_visit AS B ON A.id = B.patient_id
LEFT JOIN visit AS C ON B.visit_id = C.visit_id
LEFT JOIN users AS H ON H.id = C.nurse_id
GROUP BY A.id) AS T 
  LEFT JOIN users AS D ON T.id = D.id
  LEFT JOIN (SELECT G.id, json_agg(
  json_build_object(
    'name', E.medication_name,
    'dose', E.dosage,
    'frequency', E.frequency
  )
) AS medication FROM medication AS E LEFT JOIN patient_to_medication AS F ON E.medication_id = F.medication_id
                       LEFT JOIN users AS G ON G.id = F.patient_id
                       GROUP BY G.id) AS U ON D.id = U.id
  WHERE D.id = ${userid};`

  db.any(patientInfoQuery).then((data) => {
    res.render("pages/patientInfo", data[0]); 
  })
})

// global variable for the nurse's currently selected patient
let nurseLoggedInID = 1; // TODO temp, remove or update based on login
let currentPatientID = -1;

app.get('/nurse', (req, res) => {
  // TODO: require nurse perm level for viewing this page, else send a message that user has no access

  const patientsQuery = `SELECT id, legal_name FROM users 
    JOIN patient_to_nurse ON users.id = patient_to_nurse.patient_id
    WHERE patient_to_nurse.nurse_id = ${nurseLoggedInID};`;

    // this should not be multiple nested queries, it should use async and await and tasks
    // while this is bad practice, it works (for now).
  db.any(patientsQuery)
    .then((allPatients) => {
      // to get info for all patients of the nurse
      
      if (currentPatientID === -1) {
        currentPatientID = allPatients[0].id;
        // this should default to the nurse's lowest patient id from the db query call
      }

      console.log("allPatients:");
      console.log(allPatients);
      // all patients
      console.log("Current patient ID:");
      console.log(currentPatientID);

      // THEN queryB to get info for current patient
      const currPatientQuery = `
        SELECT * FROM users
        WHERE users.id = ${currentPatientID};`;
      const medicationsQuery = `
        SELECT medication.* FROM users
        JOIN patient_to_medication ON users.id = patient_to_medication.patient_id
        JOIN medication ON patient_to_medication.medication_id = medication.medication_id
        WHERE users.id = ${currentPatientID};`;
      const visitsQuery = `
        SELECT visit.* FROM users
        JOIN patient_to_visit ON users.id = patient_to_visit.patient_id
        JOIN visit ON patient_to_visit.visit_id = visit.visit_id
        WHERE users.id = ${currentPatientID}
        ORDER BY visit.visit_id DESC;`;
      db.any(currPatientQuery)
        .then((currPatient) => {
          console.log("Curr Patient:");
          console.log(currPatient);
          
          db.any(medicationsQuery)
            .then((medications) => {
              console.log("Medications:");
              console.log(medications);
              
              db.any(visitsQuery)
                .then((visits) => {
                  console.log("Visits:");
                  console.log(visits);
                  
                  res.render("pages/nurse", {allPatients, currPatient, medications, visits});
                })
                .catch((err) => {
                  console.log(err);
                });
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
});


app.post('/selectpatient', (req,res) => {
  let select_id = parseInt(req.body.selected_patient);
  console.log("Selected patient ID:");
  console.log(select_id);
  currentPatientID = select_id;
  res.redirect("/nurse");
});

app.post('/patientupdate', (req,res) => {
  var updateIn = req.body.updateInput;
  var currentTime = new Date();
  var currentTimeFormatted = currentTime.toISOString();
  var query = `
  INSERT INTO visit(nurse_id, notes, date)
  VALUES (${nurseLoggedInID}, '${updateIn}', '${currentTimeFormatted}');
  
  INSERT INTO patient_to_visit(patient_id, visit_id)
  VALUES (
      ${currentPatientID}, 
      (SELECT visit.visit_id FROM visit ORDER BY visit.visit_id DESC LIMIT 1) 
    );`;
  db.any(query)
    .then(function (rows) {
      // TODO send message saying update has been posted
      console.log("Patient update posted");
      console.log(`${updateIn}`);
      res.redirect("/nurse");
    })
    .catch(function (error) {
      res.send({'message' : error});
    });
});

app.get('/login', (req, res) =>{
  res.render('pages/login'); 
});
app.get('/register', (req, res) => {
  res.render('pages/register');
});
app.post('/register', async (req, res) => {
  const hash = await bcrypt.hash(req.body.password, 10);
  let query ="INSERT INTO users(username, password) VALUES($1,$2)";
  db.any(query, [req.body.username, hash])
  .then(()=> {
    res.redirect('/login')
  })
  .catch(function (err) {
  console.log(err);
    res.redirect('/register')
  });
});

app.get('/assign', (req, res) =>{
  // todo require superuser permissions to view this page
  const pQuery = `SELECT id, legal_name FROM users 
    WHERE users.permission_level = 'family';`;

  db.any(pQuery)
    .then((patientsList) => {
      const nQuery = `SELECT id, legal_name FROM users 
      WHERE users.permission_level = 'nurse';`;
      
      db.any(nQuery)
        .then((nursesList) => {
          res.render("pages/assign", {patientsList, nursesList});
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post('/assign', (req,res) => {
  let selected_pat = parseInt(req.body.selected_patient);
  let selected_nurse = parseInt(req.body.selected_nurse);;

  var query = `
  INSERT INTO patient_to_nurse(patient_id, nurse_id)
  VALUES (${selected_pat}, ${selected_nurse});`;
  
  db.any(query)
    .then(function (rows) {
      console.log(`assigned patient ${selected_pat} to nurse ${selected_nurse}`);
      res.redirect("/superuser");    
    })
    .catch(function (error) {
      res.send({'message' : error});
    });
});

app.post('/login', async (req, res) => {
console.log(req.body.username)
const query = "select * from users where username = $1";
  db.any(query, [req.body.username])
  .then(async (data) => {
    console.log(data)
    if (data.length  === 0) {
      return res.redirect('/login')
    }
    console.log(data)
    const match = await bcrypt.compare(req.body.password, data[0].password);
    if(!match){
      return res.redirect('/register')
    } else {
      req.session.user = {
        api_key: process.env.API_KEY,
      };
      req.session.save();
      res.redirect('/home')
    }
  })
  .catch(e => {
    console.log(e);
    res.redirect('/register')  
  })
});
const auth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/register');
  }
  next();
};

app.use(auth);

app.get('/logout',(req,res)=>{
  req.session.destroy(function (err) {
    res.redirect('/');
   });
});