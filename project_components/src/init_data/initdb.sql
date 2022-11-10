CREATE TYPE perms AS ENUM ('family', 'nurse', 'super');
CREATE TABLE IF NOT EXISTS users(
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  --Password size is based on the bcrypt output. I forget how big it is but it's smaller than 100
  password VARCHAR(100) NOT NULL,
  --Name is the legal name of nurse or patient (whereas username is for login, likely email).
  legal_name VARCHAR(100) NOT NULL,
  permission_level perms NOT NULL DEFAULT 'family',
  --DOB and patient_needs will only be input for patients, null for nurses
  dob TIMESTAMP,
  patient_needs VARCHAR(1000)
);
--Not sure if we need this table. 
CREATE TABLE IF NOT EXISTS patient_to_nurse(
  patient_id SERIAL REFERENCES users(id),
  nurse_id SERIAL REFERENCES users(id)
);

--Serial doesn't allow null in case anyone wondered
CREATE TABLE IF NOT EXISTS visit(
  visit_id SERIAL PRIMARY KEY,
  nurse_id SERIAL REFERENCES users(id),
  notes VARCHAR(1000),
  date TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS patient_to_visit(
  patient_id SERIAL REFERENCES users(id),
  visit_id SERIAL REFERENCES visit(visit_id)
);

CREATE TABLE IF NOT EXISTS medication(
  medication_id SERIAL PRIMARY KEY,
  medication_name VARCHAR(60) NOT NULL,
  dosage VARCHAR(30) NOT NULL,
  frequency VARCHAR(60) NOT NULL
);

CREATE TABLE IF NOT EXISTS patient_to_medication(
  patient_id SERIAL REFERENCES users(id),
  medication_id SERIAL REFERENCES medication(medication_id)
);

CREATE TABLE IF NOT EXISTS availability(
  user_id SERIAL REFERENCES users(id),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL
);



-- The following inserts could/should be removed or modified at a later time, it adds some data for testing purposes
-- This won't work exactly right considering hashed passwords

-- Add a nurse
INSERT INTO users(username, password, legal_name, permission_level)
VALUES ('nursetest', 'abc', 'Test Nurse', 'nurse');
-- And some patients
INSERT INTO users(username, password, legal_name, permission_level, dob, patient_needs)
VALUES ('john', '123', 'John Snow', 'family', '2012-04-23T18:25:43.511Z', 'Lorem Ipsum');
INSERT INTO users(username, password, legal_name, permission_level, dob, patient_needs)
VALUES ('jane', '456', 'Jane Doe', 'family', '1990-12-23T18:25:43.511Z', 'test needs something');

-- Connect those patients to the nurse
INSERT INTO patient_to_nurse(patient_id, nurse_id)
VALUES (2, 1);
INSERT INTO patient_to_nurse(patient_id, nurse_id)
VALUES (3, 1);

-- Make some visit reports
INSERT INTO visit(nurse_id, notes, date)
VALUES (1, 'great', '2021-10-23T18:25:43.511Z');
INSERT INTO visit(nurse_id, notes, date)
VALUES (1, 'doing well', '2021-12-23T18:25:43.511Z');
INSERT INTO visit(nurse_id, notes, date)
VALUES (1, 'one update', '2020-12-23T18:25:43.511Z');
INSERT INTO visit(nurse_id, notes, date)
VALUES (1, 'another update', '2021-12-23T18:25:43.511Z');

-- Connect those visits to their patients
-- TODO
INSERT INTO patient_to_visit(patient_id, visit_id)
VALUES (3, 1);
INSERT INTO patient_to_visit(patient_id, visit_id)
VALUES (3, 2);
INSERT INTO patient_to_visit(patient_id, visit_id)
VALUES (2, 3);
INSERT INTO patient_to_visit(patient_id, visit_id)
VALUES (2, 4);

-- Make some medications
INSERT INTO medication(medication_name, dosage, frequency)
VALUES ('Youth Serum', '500mg', 'Daily');
INSERT INTO medication(medication_name, dosage, frequency)
VALUES ('Something else', '40mg', 'Each morning');
INSERT INTO medication(medication_name, dosage, frequency)
VALUES ('Miracle Drug', '80mg', 'Daily');
INSERT INTO medication(medication_name, dosage, frequency)
VALUES ('Advil', '30mg', 'Daily');

-- Connect those medications to their patients
INSERT INTO patient_to_medication(patient_id, medication_id)
VALUES (2, 1);
INSERT INTO patient_to_medication(patient_id, medication_id)
VALUES (2, 2);
INSERT INTO patient_to_medication(patient_id, medication_id)
VALUES (3, 3);
INSERT INTO patient_to_medication(patient_id, medication_id)
VALUES (3, 4);