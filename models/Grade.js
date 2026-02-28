const mongoose = require('mongoose');

const GradeSchema = new mongoose.Schema({
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
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    assessmentType: {
        type: String,
        enum: ['quiz', 'assignment', 'midterm', 'final', 'project', 'participation', 'other'],
        required: true
    },
    assessmentName: {
        type: String,
        required: true
    },
    maxMarks: {
        type: Number,
        required: true,
        min: 1
    },
    obtainedMarks: {
        type: Number,
        required: true,
        min: 0
    },
    percentage: {
        type: Number,
        default: function() {
            return (this.obtainedMarks / this.maxMarks) * 100;
        }
    },
    grade: {
        type: String,
        enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'],
        default: function() {
            const percentage = (this.obtainedMarks / this.maxMarks) * 100;
            if (percentage >= 90) return 'A+';
            if (percentage >= 80) return 'A';
            if (percentage >= 75) return 'A-';
            if (percentage >= 70) return 'B+';
            if (percentage >= 65) return 'B';
            if (percentage >= 60) return 'B-';
            if (percentage >= 55) return 'C+';
            if (percentage >= 50) return 'C';
            if (percentage >= 45) return 'C-';
            if (percentage >= 40) return 'D';
            return 'F';
        }
    },
    remarks: {
        type: String
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Grade', GradeSchema);