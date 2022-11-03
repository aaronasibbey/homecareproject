### User Acceptance Testing Plan

**Three features that need to be tested by our users, and anticipated user activity / results to verify proper functionality of the features:**

- Nurse/Patient Login
  - This should show a simple form that allows to input username/email, password, and if they’re a nurse or family member / patient
  - If nurse login correct: Redirect to nurse portal
  - If nurse login incorrect: Redirect to login and show an error message
  - If patient login correct: Redirect to patient portal 
  - If patient login incorrect: Redirect to login and show an error message

- Patient Info
  - Shows the info for the patient relevant to the logged in user.
  - If logged in, render the patient info page
  - If not logged in, redirect to login and show error message

- Nurse Portal
  - Shows the patients for the logged in user and shows fields allowing the modification of patient data
  - If logged in, render nurse portal
  - Nurse can post an update for their patient
  - If not logged in, redirect to login page and show error message

**Instructions we will give to the testers include (beginning from the home page):**
- “Acting as a nurse, please sign in to the website and check when you need to visit with a patient (name), and what medications you will have to provide them.”
- “Still acting as a nurse, provide the following update on patient (different name): ‘He is doing well this morning!’”
- Log out of the website.
**Another set of instructions:**
- “Acting as a family member of a patient, please sign into the website with these credentials”
- “As a family member, read what the latest update made about them is”
- Log out of the website.


**Our test data results will be:** Was the user properly able to execute each of the above actions? Was it intuitive? Did anything malfunction or cause an error?

**The test environment** will be the deployed release of the application on the CU servers with which we are hosting our website, or a local environment running a web server and database in a docker container.

**Our user acceptance testers will be** some of our fellow students on campus who we are friends with and who understand how to use websites with fairly basic instructions.
