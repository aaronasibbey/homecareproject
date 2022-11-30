const express = require('express');
const app = express();
const pgp = require('pg-promise')();
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const axios = require('axios');

const {addusers, addMedications, dropData} = require('./addUsers');


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
.then(async (obj) => {
    console.log('Database connection successful');
    await dropData(db);
    await addusers(db);
    await addMedications(db);
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

app.use((req, res, next) => {
  if(req.session.user)
    res.locals.user = req.session.user;
  next();
})

app.get('/', (req, res) =>{
    res.redirect('/home');
  });

app.get('/home', (req, res) => {
    res.render("pages/home");
});

app.get('/login', (req, res) => {
    res.render("pages/login");
  });

app.post('/login', async (req, res) => {
  // console.log(req.body.username)
  const query = "select * from users where username = $1";
    db.any(query, [req.body.username])
    .then(async (data) => {
      // console.log(data)
      if (data.length  === 0) {
        return res.redirect('/login');
      }
      // console.log(data)
      const match = await bcrypt.compare(req.body.password, data[0].password);
      if(!match){
        return res.redirect('/register');
      } else {
        req.session.user = {
          user_id: data[0].id,
          permission_level: data[0].permission_level,
        };
        req.session.save();
        // console.log(`query uid: ${data[0].id}   query permission_level: ${data[0].permission_level}`);
        // console.log(`session user_id: ${req.session.user.user_id}   session permission_level: ${req.session.user.permission_level} `);
        return res.redirect('/home');
      }
    })
    .catch(e => {
      console.log(e);
      res.redirect('/register');
    })
  });
    

// pages / methods below are only for logged in users
const auth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};

app.use(auth);

app.get('/register', (req, res) => {
  // superuser is the one registering users, only they should be able to access this page
  if (!req.session.user.permission_level) return res.redirect("/home");
  // require superuser perm level for viewing this page
  else if (req.session.user.permission_level === "family" || req.session.user.permission_level === "nurse") {
    return res.redirect("/home");
  }
  else res.render("pages/register");
  });

app.get('/superuser', (req, res) => {
  if (!req.session.user.permission_level) return res.redirect("/home");
  // require superuser perm level for viewing this page
  else if (req.session.user.permission_level === "family" || req.session.user.permission_level === "nurse") {
    return res.redirect("/home");
  }
  else res.render("pages/superuser");
});

// global variable for the nurse's currently selected patient
let currentPatientID = -1;

app.get('/nurse', (req, res) => {
  if (!req.session.user.permission_level) return res.redirect("/home"); 
  // require nurse or super perm level for viewing this page, else send a message that user has no access
  else if (req.session.user.permission_level === "family") {
    return res.redirect("/home");
  }

  let patientsQuery = `SELECT id, legal_name FROM users 
    JOIN patient_to_nurse ON users.id = patient_to_nurse.patient_id
    WHERE patient_to_nurse.nurse_id = ${req.session.user.user_id};`;
  
  if (req.session.user.permission_level === "super") {
    // if the superuser is viewing the nurse portal, they should be able to see all users
    patientsQuery = `SELECT id, legal_name FROM users 
    WHERE users.permission_level = 'family';`;
  }

    // this should not be multiple nested queries, it should use async and await and tasks
    // while this is bad practice, it works (for now).
  db.any(patientsQuery)
    .then((allPatients) => {
      // to get info for all patients of the nurse
      
      if (currentPatientID === -1) {
        currentPatientID = allPatients[0].id;
        // this should default to the nurse's lowest patient id from the db query call
      }

      // console.log("allPatients:");
      // console.log(allPatients);
      // all patients
      // console.log("Current patient ID:");
      // console.log(currentPatientID);

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
          // console.log("Curr Patient:");
          // console.log(currPatient);
          
          db.any(medicationsQuery)
            .then((medications) => {
              // console.log("Medications:");
              // console.log(medications);
              
              db.any(visitsQuery)
                .then((visits) => {
                  // console.log("Visits:");
                  // console.log(visits);
                  
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
  // console.log("Selected patient ID:");
  // console.log(select_id);
  currentPatientID = select_id;
  res.redirect("/nurse");
});

app.post('/patientupdate', (req,res) => {
  var updateIn = req.body.updateInput;
  var currentTime = new Date();
  var currentTimeFormatted = currentTime.toISOString();
  var query = `
  INSERT INTO visit(nurse_id, notes, date)
  VALUES (${req.session.user.user_id}, '${updateIn}', '${currentTimeFormatted}');
  
  INSERT INTO patient_to_visit(patient_id, visit_id)
  VALUES (
      ${currentPatientID}, 
      (SELECT visit.visit_id FROM visit ORDER BY visit.visit_id DESC LIMIT 1) 
    );`;
  db.any(query)
    .then(function (rows) {
      // console.log("Patient update posted");
      // console.log(`${updateIn}`);
      res.redirect("/nurse");
    })
    .catch(function (error) {
      res.send({'message' : error});
    });
});

app.post('/register', async (req, res) => {
  const hash = await bcrypt.hash(req.body.password, 10);
  let query ="INSERT INTO users(username, password, permission_level, dob, patient_needs, legal_name) VALUES($1,$2, $3, $4, $5, $6)";
  db.any(query, [req.body.username, hash, req.body.permission_level, req.body.dob, req.body.patient_needs, req.body.legal_name])
  .then(()=> {
    res.redirect('/login')
  })
  .catch(function (err) {
    console.log(err);
    res.redirect('/register')
  });
});

app.get('/assign', (req, res) =>{
  // require superuser permissions to view this page
  if (!req.session.user.permission_level) return res.redirect("/home");
  else if (req.session.user.permission_level === "family" || req.session.user.permission_level === "nurse") {
    return res.redirect("/home");
  }
  else {
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
    }
});

app.post('/assign', (req,res) => {
  let selected_pat = parseInt(req.body.selected_patient);
  let selected_nurse = parseInt(req.body.selected_nurse);;

  var query = `
  INSERT INTO patient_to_nurse(patient_id, nurse_id)
  VALUES (${selected_pat}, ${selected_nurse});`;
  
  db.any(query)
    .then(function (rows) {
      // console.log(`assigned patient ${selected_pat} to nurse ${selected_nurse}`);
      res.redirect("/superuser");    
    })
    .catch(function (error) {
      res.send({'message' : error});
    });
});

app.get('/med', (req, res) =>{
  // require superuser permissions to view this page
  if (!req.session.user.permission_level) return res.redirect("/home");
  else if (req.session.user.permission_level === "family" || req.session.user.permission_level === "nurse") {
    return res.redirect("/home");
  }
  else {
    const pQuery = `SELECT id, legal_name FROM users 
      WHERE users.permission_level = 'family';`;

    db.any(pQuery)
      .then((patientsList) => {
        res.render("pages/med", {patientsList});
      })
      .catch((err) => {
        console.log(err);
      });
    }
});

app.post('/med', (req,res) => {
  let selected_pat = parseInt(req.body.selected_patient);
  let name = req.body.medication_name;
  let dosage = req.body.dosage;
  let freq = req.body.frequency;

  var query = `INSERT INTO medication(medication_name, dosage, frequency)
  VALUES ('${name}', '${dosage}', '${freq}');
  INSERT INTO patient_to_medication(patient_id, medication_id)
  VALUES (${selected_pat}, (SELECT currval(pg_get_serial_sequence('medication','medication_id'))));`;
  
  db.any(query)
    .then(function (rows) {
      res.redirect("/superuser");    
    })
    .catch(function (error) {
      res.send({'message' : error});
    });
});

app.get('/logout',(req,res)=>{
  req.session.destroy(function (err) {
    res.redirect('/');
   });
});

app.get('/patientInfo', (req, res)=> {
  // only patients should be able to access this page
  if (req.session.user.permission_level === "family") {
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
    WHERE D.id = ${req.session.user.user_id};`

    db.any(patientInfoQuery).then((data) => {
      res.render("pages/patientInfo", data[0]); 
    })
  }
  else {
    return res.redirect("/home");
  }
})