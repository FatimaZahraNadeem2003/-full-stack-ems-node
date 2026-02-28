const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    enrollmentDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['enrolled', 'dropped', 'completed', 'pending'],
        default: 'enrolled'
    },
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    completionDate: {
        type: Date
    },
    grade: {
        type: String,
        enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F', 'Incomplete', 'Not Graded'],
        default: 'Not Graded'
    },
    marksObtained: {
        type: Number,
        min: 0,
        max: 100
    },
    remarks: {
        type: String
    }
}, {
    timestamps: true
});

EnrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', EnrollmentSchema);