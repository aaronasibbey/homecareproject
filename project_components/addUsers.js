const bcrypt = require('bcrypt');

const addusers = async (db)=>{
  const pwd = await bcrypt.hash("pwd", 10);
  await db.any(`INSERT INTO users 
                (username, password, legal_name, permission_level, dob, patient_needs) 
                  VALUES ('admin', '${pwd}', 'admin', 'super', '10/06/2002', 'na'),
                         ('family', '${pwd}', 'patient name here', 'family', '10/04/2002', 'na'),
                         ('nurse', '${pwd}', 'Nursetta', 'nurse', '10/05/2002', 'na')`)
}

module.exports = {addusers};