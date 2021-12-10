var mysql = require('promise-mysql')

var pool

// connect to mysql database
mysql.createPool({
    connectionLimit: 3,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'collegedb'
})
    .then(p => {
        pool = p
    })
    .catch(e => {
        console.log("pool error:" + e)
    })

// function to get modules from database
function getModules() {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM module')
            .then((data) => {
                resolve(data)
            })
            .catch((error) => {
                reject(error)
            })
    })
}

// function to get speific modules from database by passing in module id
function getModule(mid) {
    return new Promise((resolve, reject) => {
        var myQuery = {
            sql: 'SELECT * FROM module WHERE mid = ?',
            values: [mid]
        }
        pool.query(myQuery)
            .then((data) => {
                resolve(data)
            })
            .catch((error) => {
                reject(error)
            })
    })
}

// function to edit modules from database
function editModule(mid, name, credits) {
    return new Promise((resolve, reject) => {
        var myQuery = {
            sql: 'UPDATE module SET name = ?, credits = ? WHERE mid = ?',
            values: [name, credits, mid]
        }
        pool.query(myQuery)
            .then((data) => {
                resolve(data)
            })
            .catch((error) => {
                reject(error)
            })
    })
}

// function to get students studying that particular module by passing in module id from database
function getStudyingModule(mid) {
    return new Promise((resolve, reject) => {
        var myQuery = {
            sql: 'SELECT sm.sid, s.name, s.gpa FROM student_module sm left join student s on sm.sid = s.sid WHERE mid = ?',
            values: [mid]
        }
        pool.query(myQuery)
            .then((data) => {
                resolve(data)
            })
            .catch((error) => {
                reject(error)
            })
    })
}

// function to get students from database
function getStudents() {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM student')
            .then((data) => {
                resolve(data)
            })
            .catch((error) => {
                reject(error)
            })
    })
}

// function to delete student from database by passing in student id
function deleteStudent(sid) {
    return new Promise((resolve, reject) => {
        var myQuery = {
            sql: 'DELETE FROM student WHERE sid = ?',
            values: [sid]
        }
        pool.query(myQuery)
            .then((data) => {
                resolve(data)
            })
            .catch((error) => {
                reject(error)
            })
    })
}

// function to inser student into database by passing in student id, name and gpa
function insertStudent(sid, name, gpa) {
    return new Promise((resolve, reject) => {
        var myQuery = {
            sql: 'INSERT INTO student (sid, name, gpa) values (?, ?, ?)',
            values: [sid, name, gpa]
        }
        pool.query(myQuery)
            .then((data) => {
                resolve(data)
            })
            .catch((error) => {
                reject(error)
            })
    })
}

// function to get departments from database
function getDept() {
    return new Promise((resolve, reject) => {
        pool.query('SELECT * FROM dept')
            .then((data) => {
                resolve(data)
            })
            .catch((error) => {
                reject(error)
            })
    })
}

// export functions
module.exports = { getModules, getModule, editModule, getStudyingModule, getStudents, deleteStudent, insertStudent, getDept }