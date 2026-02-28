const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
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
    dayOfWeek: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        required: true
    },
    startTime: {
        type: String,  
        required: true
    },
    endTime: {
        type: String,  
        required: true
    },
    room: {
        type: String,
        required: true
    },
    building: {
        type: String
    },
    duration: {
        type: Number,  
        default: function() {
            if (this.startTime && this.endTime) {
                const start = this.startTime.split(':');
                const end = this.endTime.split(':');
                const startMinutes = parseInt(start[0]) * 60 + parseInt(start[1]);
                const endMinutes = parseInt(end[0]) * 60 + parseInt(end[1]);
                return endMinutes - startMinutes;
            }
            return 0;
        }
    },
    semester: {
        type: String,
        required: true
    },
    academicYear: {
        type: String,
        required: true
    },
    isRecurring: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'cancelled', 'completed'],
        default: 'scheduled'
    }
}, {
    timestamps: true
});

ScheduleSchema.index(
    { dayOfWeek: 1, startTime: 1, endTime: 1, room: 1 },
    { unique: true }
);

module.exports = mongoose.model('Schedule', ScheduleSchema);