# Project-16-express-shop

## Technologies used:

    pug, sequelize, mysql, bootstrap 4, nodemailer

## Middlewears:

    csrf, Multer, express-session, express-validator

## Error Handling
Basic error handling has been implementing. Both for Errors and for Page Not Found.

## MVC pattern

M - Model folders contains models\
V - View folder contains pug files for:
* Admin, which are all user logged in routes
* Auth, which is for login, signup and reseting the password
* Layouts, which is the Main pug file
* Store, which contains all none logged in routes

C - Controller, which is a logic for all routes (admin, auth, error & store)


## Public & Images folders
Public - contains all FRONT END associated folders and files, like front end JS and CSS.\
Images - folder with images imported by users. This folder has an additional logic, which helps to create sub-folders based on year/month/day.


# How to start the app.

To run the app, db credientials must be put.\
To create all the tables and associations, uncomment row 110 in app.js.

    .sync({ force: true })

This line creates everything. Run 'npm start'.\
Once all created, comment it out, and 'npm start' again.

