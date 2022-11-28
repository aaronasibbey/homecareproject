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

const nurse_names = [
  "Kamala Harris",
  "Snow White",
  "Amy Smith"
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
  for(let j = 0; j < names.length - 4; j++){
    await db.any(`
    INSERT INTO patient_to_nurse (patient_id, nurse_id)
    VALUES ((SELECT id FROM users WHERE legal_name='${names[j]}'), (SELECT id FROM users WHERE legal_name='${nurse_names[j % 3]}'))
    `)

    const id1 = await db.any(`INSERT INTO visit 
                  (nurse_id, notes, date) 
                  VALUES ((SELECT id FROM users WHERE legal_name='${nurse_names[j % 3]}'), '${"Patient was well; up and moving. Took Medication"}', '${Math.floor(Math.random() * 12 + 1)}/${Math.floor(Math.random() * 28 + 1)}/2022') RETURNING visit_id`);
    const id2 = await db.any(`INSERT INTO visit 
                  (nurse_id, notes, date) 
                  VALUES ((SELECT id FROM users WHERE legal_name='${nurse_names[j % 3]}'), '${"Patient fine but sluggish. Took medication."}', '${Math.floor(Math.random() * 12 + 1)}/${Math.floor(Math.random() * 28 + 1)}/2022') RETURNING visit_id`);
    await db.any(`INSERT INTO patient_to_visit 
                  (patient_id, visit_id) 
                  VALUES ((SELECT id FROM users WHERE legal_name='${names[j]}'), ${id1[0]['visit_id']}),
                          ((SELECT id FROM users WHERE legal_name='${names[j]}'), ${id2[0]['visit_id']})`);
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
      let numMedName = Math.floor(Math.random() * 6);
      let numMedDose = Math.floor(Math.random() * 5);
      let numMedFreq = Math.floor(Math.random() * 4);

      await db.any(`INSERT INTO patient_to_medication 
                  (patient_id, medication_id) 
                  VALUES ((SELECT id FROM users WHERE legal_name='${names[i]}'), (SELECT medication_id FROM medication WHERE medication_name='${medication_names[numMedName]}' AND dosage='${doses[numMedDose]}' AND frequency='${frequencies[numMedFreq]}'));`)
    }
  }
}

//Need to drop data so we don't get a bunch of repeat data in the database between reboots
const dropData = async (db)=>{
  await db.any(`DELETE FROM patient_to_visit;`)
  await db.any(`DELETE FROM patient_to_medication;`)
  await db.any(`DELETE FROM availability;`)
  await db.any(`DELETE FROM patient_to_nurse;`)

  await db.any(`DELETE FROM medication;`)
  await db.any('ALTER SEQUENCE medication_medication_id_seq RESTART WITH 1')

  await db.any(`DELETE FROM visit;`)
  await db.any('ALTER SEQUENCE visit_visit_id_seq RESTART WITH 1')

  await db.any(`DELETE FROM users;`)
  await db.any('ALTER SEQUENCE users_id_seq RESTART WITH 1')
}


module.exports = {addusers, addMedications, dropData};