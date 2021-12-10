var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var mySqlDao = require('./mySqlDao')
var mongoDAO = require('./mongoDAO')
let ejs = require('ejs')
const { check, validationResult } = require('express-validator');

// set view engine for ejs
app.set('view engine', 'ejs')

// body parser to process data sent through an HTTP request body
app.use(bodyParser.urlencoded({ extended: false }))

// get request from url, in this case '/' = home page/domain
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/mainpage.html')
})

// get request from /listModules and list modules
app.get('/listModules', (req, res) => {
    mySqlDao.getModules()
        .then((data) => {
            // render modules to output data
            res.render('modules', { modules: data })
        })
        .catch((error) => {
            // send error
            res.send(error)
        })
})

// get request from /module/edit/:mid and call function to edit module
app.get('/module/edit/:mid', (req, res) => {
    // call function to write out query by passing in module id
    mySqlDao.getModule(req.params.mid)
        .then((data) => {
            // render ejs to output form
            res.render('editModule', { errors: undefined, mid: data[0].mid, name: data[0].name, credits: data[0].credits })
        })
        .catch((error) => {
            // send error
            res.send(error)
        })
})

// post to send data to page 
app.post('/module/edit/:mid',
    [
        // check requirements using express validator
        check('name').isLength({ min: 5 }).withMessage("Module Name should be a minimum of 5 characters"),
        check('credits').isIn([5, 10, 15]).withMessage("Credits can be either 5, 10 or 15")
    ],
    (req, res) => {
        // get errors (if there's any)
        var errors = validationResult(req)

        // if errors not empty, resubmit/re-edit module, else edit module
        if (!errors.isEmpty()) {
            // render page again wth errors
            res.render('editModule', { errors: errors.errors, mid: req.params.mid, name: req.body.name, credits: req.body.credits })
        } else {
            // call function to write query to edit module
            mySqlDao.editModule(req.params.mid, req.body.name, req.body.credits)
                .then((data) => {
                    // redirect to /listModules page if edited successfully
                    res.redirect('/listModules')
                })
                .catch((error) => {
                    // send error
                    res.send(error)
                })
        }
    })

// get request from /module/students/:mid and list students that study that module
app.get('/module/students/:mid', (req, res) => {
    // call function to write out query to get students studying that particular module by passing in module id
    mySqlDao.getStudyingModule(req.params.mid)
        .then((data) => {
            // render stuyingModules to output data
            res.render('studyingModules', { modules: data, mid: req.params.mid })
        })
        .catch((error) => {
            // send error
            res.send(error)
        })
})

// get request from /listStudents and list students
app.get('/listStudents', (req, res) => {
    // call function to write out query to get students from mysql database
    mySqlDao.getStudents()
        .then((data) => {
            // render students to output data
            res.render('students', { students: data })
        })
        .catch((error) => {
            // send error
            res.send(error)
        })
})

// get request from /students/delete/:sid and delete students
app.get('/students/delete/:sid', (req, res) => {
    // call function to write out query to delete student
    mySqlDao.deleteStudent(req.params.sid)
        .then((data) => {
            // redirect to /listStudents if deleted successfully
            res.redirect('/listStudents')
        })
        .catch((error) => {
            // if error == 1451 (data associated with other tables), output error message, else output other error message
            if (error.errno == 1451) {
                res.send("<h1>Error Message</h1><br><br><h2>" + req.params.sid + " has associated modules he/she cannt be deleted</h2><br><a href='/'>Home</a>")
            } else {
                res.send("<h1>Other Error: " + error.sqlMessage + "</h1><br><a href='/'>Home</a>")
            }
        })
})

// get request from /addStudent and render addStudent page
app.get('/addStudent', (req, res) => {
    // render addStudent page
    res.render('addStudent', { errors: undefined, sid: undefined, name: undefined, gpa: undefined })
})

// post to send data to page
app.post('/addStudent',
    [
        // check requirements using express validator
        check('sid').isLength(4).withMessage("Student ID must be 4 characters"),
        check('name').isLength({ min: 5 }).withMessage("Name must be at least 5 characters"),
        check('gpa').isFloat({ min: 0.0, max: 4.0 }).withMessage("GPA must be between 0.0 & 4.0")
    ],
    (req, res) => {
        // get errors (if there's any)
        var errors = validationResult(req)

        // if errors not empty, resubmit/re-add student, else add student 
        if (!errors.isEmpty()) {
            // render page again with errors
            res.render('addStudent', { errors: errors.errors, sid: req.body.sid, name: req.body.name, gpa: req.body.gpa })
        } else {
            // call funtion to write query to insertStudent into database
            mySqlDao.insertStudent(req.body.sid, req.body.name, req.body.gpa)
                .then((data) => {
                    // redirect to /listStudents page if added successfully
                    res.redirect('/listStudents')
                })
                .catch((error) => {
                    // if error no == 1062 (same id exists), output error message and render same page with errors; else send error as usual
                    if (error.errno == 1062) {
                        errors = []
                        newError = { msg: "Error: " + error.code + ": " + error.sqlMessage }
                        errors.push(newError)
                        res.render('addStudent', { errors: errors, sid: req.body.sid, name: req.body.name, gpa: req.body.gpa })
                    } else {
                        res.send(error)
                    }
                })
        }
    })

// get request from /listLecturers and list lecturers
app.get('/listLecturers', (req, res) => {
    // call function to list lecturers from mongo database
    mongoDAO.getLecturers()
        .then((data) => {
            // render lecturers page to show lecturers
            res.render('lecturers', { lecturers: data })
        })
        .catch((error) => {
            // send error
            res.send(error)
        })
})

// get request from /addLecturer and render addLecturer page
app.get('/addLecturer', (req, res) => {
    res.render('addLecturer', { errors: undefined, _id: undefined, name: undefined, dept: undefined })
})

// post to send data to page
app.post('/addLecturer',
    [
        // check requirements using express validator
        check('_id').isLength({ min: 4, max: 4 }).withMessage("Lecturer ID must be 4 characters"),
        check('name').isLength({ min: 5 }).withMessage("Name must be at least 5 characters"),
        check('dept').isLength({ min: 3, max: 3 }).withMessage("Dept must be 3 characters")
    ],
    (req, res) => {
        // get errors (if there's any)
        var errors = validationResult(req)
        var dept = false // set department match = false

        // call function to get all departments from mysql database
        mySqlDao.getDept()
            .then((data) => {
                // loop through each data
                data.forEach(element => {
                    // if department input match with database department, return and continue add lecturer
                    if (element.did.toUpperCase() == req.body.dept.toUpperCase()) {
                        dept = true
                        return
                    }
                });

                // if department input cannot match any of the department in mysql database, error message added
                if (dept == false) {
                    newError = { msg: "Dept doesn't exists" }
                    errors.errors.push(newError)
                }

                // if errors not empty, resubmit/re-add lecturer, else add lecturer 
                if (!errors.isEmpty()) {
                    // render page again with errors
                    res.render('addLecturer', { errors: errors.errors, _id: req.body._id, name: req.body.name, dept: req.body.dept })
                } else {
                    // call function to add lecturer into mongo database
                    mongoDAO.insertStudent(req.body)
                        .then((data) => {
                            // redirect to /listLecturers page if added successfully
                            res.redirect('/listLecturers')
                        })
                        .catch((error) => {
                            // if error code == 11000 (same id exists), output error message and render same page with errors; else send error as usual
                            if (error.code == 11000) {
                                errors = []
                                newError = { msg: "_id already exists" }
                                errors.push(newError)
                                res.render('addLecturer', { errors: errors, _id: req.body._id, name: req.body.name, dept: req.body.dept })
                            } else {
                                // send error
                                res.send(error)
                            }
                        })
                }
            })
            .catch((error) => {
                // send error
                res.send(error)
            })
    })

// get request from /listDepartments and list departments  
app.get('/listDepartments', (req, res) => {
    // call function to write out query to get departments from mysql database
    mySqlDao.getDept()
        .then((data) => {
            // render departments page to show all departments in database
            res.render('departments', { departments: data })
        })
        .catch((error) => {
            // send error
            res.send(error)
        })
})

// listen from port 3000
app.listen(3000, () => {
    console.log("Listening on port 3000...")
})