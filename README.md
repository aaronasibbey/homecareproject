# homecare-project

Our Application, 'HomeCare' is an interactive app to pair privately practicing nurses with patients in need of care at their own homes.

Patients' family members are able to view updates on the status of their relative which are provided by the nurse(s) who is/are caring for their family member.

Nurses are able to view the medical needs and schedules of each of the patients to which they are assigned and post private updates about their visits with each patient.
 
A superuser administrator is able to register new nurses/patients, and make assignments of which patients are seen by which nurses.

### Contributors:
- Jack McKinstry @jackmckinstry
- Aaron Asibbey @aaronasibbey
- Nick Henley @nh602
- David Ustyan @dustyan
- Nate Weaver @Nweaver43

### Technology used:
- Project Tracker: GitHub Projects (project board linked to repo)
- VCS repository GitHub (in this repository)
- Database: PostgreSQL
- IDE: VSCode
- UI Tools: HTML, EJS, JavaScript, CSS
- Application Server: NodeJS
- Deployment environment: LocalHost & CU Boulder Private Servers
- Styling framework: [Bootstrap](https://getbootstrap.com/)
- Database diagrams: [dbdiagram.io](https://dbdiagram.io/)
- Containerization: [Docker](https://www.docker.com/)

### Prerequisites to run the application:
[Docker](https://www.docker.com/) must be installed

### How to run the application locally:
1. Clone the repository with `git clone https://github.com/jackmckinstry/homecare-project.git`

1. Navigate into the `/homecare-project/project_components/` directory

1. From a shell within the `/project_components/` directory run: `docker-compose run npm install` on the initial run in order to install node modules **OR** `docker-compose up` on all starts following the initial

1. Wait for Docker to print `Server is listening on port 3000` and `Database connection successful` in the shell terminal

1. Navigate to `localhost:3000` in any web browser

### Deployed Application

The deployed application can be used [here](http://csci3308.int.colorado.edu:49158) if connected to the CU Boulder Wireless network

### Video Demo

https://user-images.githubusercontent.com/89474444/204945542-9e1c592c-6a83-464e-9715-60ef892e7b28.mp4
