const mongoose = require('mongoose');
const User = require('./User');
const Student = require('./Student');
const Teacher = require('./Teacher');
const Course = require('./Course');
const Schedule = require('./Schedule');
const Enrollment = require('./Enrollment');
const Grade = require('./Grade');

module.exports = {
    User,
    Student,
    Teacher,
    Course,
    Schedule,
    Enrollment,
    Grade
};