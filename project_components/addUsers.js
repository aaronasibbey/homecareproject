const bcrypt = require('bcrypt');

const names = [
  "John Snow",
  "Jack Sparrow",
  "Martin Luther",
  "Calvin Klein",
  "Joe Biden",
  "Donald Trump",
  "Barack Obama",
  "Bill Nye",
  "Kurt Cobain",
  "Steve Irwin",
  "Michael Jackson",
  "Jackson Pollock",
  "Tim Burton",
  "Elizabeth Swan",
  "Kamala Harris",
  "Snow White",
  "Amy Smith",
  "Admin"
];

const permission_levels = [
  'family',
  'family',
  'family',
  'family',
  'family',
  'family',
  'family',
  'family',
  'family',
  'family',
  'family',
  'family',
  'family',
  'family',
  'nurse',
  'nurse',
  'nurse',
  'super'
]

const patient_needs = [
  'Daily check in on mood and health',
  'Daily check in on mood and health',
  'Daily check in on mood and health',
  'Daily check in on mood and health',
  'Make sure they took medication',
  'Make sure they took medication',
  'Make sure they took medication',
  'Weekly check in and chores helpout',
  'Weekly check in and chores helpout',
  'Weekly check in and chores helpout',
  'Weekly check in and chores helpout',
  'Weekly check in and chores helpout',
  'Weekly check in and chores helpout',
  'Weekly check in and chores helpout',
  'na',
  'na',
  'na',
  'na'
]



const addusers = async (db)=>{
  //Inserts a bunch of fake users
  const pwd = await bcrypt.hash("pwd", 10);
  for(let i = 0; i < names.length; i++){
    await db.any(`INSERT INTO users 
                  (username, password, legal_name, permission_level, dob, patient_needs) 
                  VALUES ('${names[i]}', '${pwd}', '${names[i]}', '${permission_levels[i]}', '${Math.floor(Math.random() * 12 + 1)}/${i + 1}/2002', '${patient_needs[i]}')`);
  }

  //Add nurses to patients
  for(let j = 1; j <= 5; j++){
    await db.any(`INSERT INTO patient_to_nurse 
                  (patient_id, nurse_id) 
                  VALUES (${j}, ${15})`);
  }
  for(let j = 6; j <= 10; j++){
    await db.any(`INSERT INTO patient_to_nurse 
    (patient_id, nurse_id) 
    VALUES (${j}, ${16})`)
  }
  for(let j = 11; j <= 14; j++){
    await db.any(`INSERT INTO patient_to_nurse 
    (patient_id, nurse_id) 
    VALUES (${j}, ${17})`)
  }
}

//The website I looked at to get these listed a lot of antidepressants ig
const medication_names = [
  'Advil',
  'Prozac',
  'Zestril',
  'Zoloft',
  'Singulair',
  'Lexapro'
]

const doses = [
  '30mg',
  '20mg',
  '100mg',
  '10mg',
  '5mg',
]

const frequencies = [
  'Once daily',
  'twice daily', 
  'Before bed',
  'With Breakfast',
]

//Make a medication for each name with every frequency and dose combination.
const addMedications = async (db)=>{
  //Inserts a bunch of fake users
  const pwd = await bcrypt.hash("pwd", 10);
  for(let i = 0; i < medication_names.length; i++){
    for(let j = 0; j < doses.length; j++){
      for(let k = 0; k < frequencies.length; k++){
        await db.any(`INSERT INTO medication 
                  (medication_name, dosage, frequency) 
                  VALUES ('${medication_names[i]}', '${doses[j]}', '${frequencies[k]}');`)
      }
    }
  }

  for(let i = 1; i < names.length - 4 + 1; i++){
    //Random number of meds between 1 and 3
    let numMeds = Math.floor(Math.random() * 3 + 1);

    for(let j=0; j < numMeds; j++){
      //There are 120 medication combos. Pick randomly from all 120
      let val = Math.floor(Math.random() * 120 + 1);

      await db.any(`INSERT INTO patient_to_medication 
                  (patient_id, medication_id) 
                  VALUES ('${i}', '${val}');`)
    }
  }
}



module.exports = {addusers, addMedications};