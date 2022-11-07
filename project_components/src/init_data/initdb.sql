CREATE TYPE perms AS ENUM ('family', 'nurse', 'super');
CREATE TABLE IF NOT EXISTS users(
  id SERIAL PRIMARY KEY,
  usersname VARCHAR(30) NOT NULL,
  --Password size is based on the bcrypt output. I forget how big it is but it's smaller than 100
  password VARCHAR(100) NOT NULL,
  permission_level perms NOT NULL DEFAULT 'family'
);
--Not sure if we need this table. 
CREATE TABLE IF NOT EXISTS patient_to_nurse(
  patient_id SERIAL REFERENCES users(id),
  nurse_id SERIAL REFERENCES users(id)
);
--Serial doesn't allow null in case anyone wondered
CREATE TABLE IF NOT EXISTS visit(
  id SERIAL PRIMARY KEY,
  nurse_id SERIAL REFERENCES users(id),
  patient_id SERIAL REFERENCES users(id),
  notes VARCHAR(1000),
  date TIMESTAMP NOT NULL
);
CREATE TABLE IF NOT EXISTS medication(
  patient_id SERIAL REFERENCES users(id),
  name VARCHAR(60) NOT NULL,
  dosage VARCHAR(30) NOT NULL,
  frequency VARCHAR(60) NOT NULL
);
CREATE TABLE IF NOT EXISTS availability(
  user_id SERIAL REFERENCES users(id),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL
);
--These will be used to verify the users identity when enrolling
CREATE TABLE IF NOT EXISTS enrollCode(
  user_id SERIAL REFERENCES users(id),
  code VARCHAR(6) NOT NULL,
  expires TIMESTAMP NOT NULL
);