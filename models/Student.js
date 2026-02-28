const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    dateOfBirth: {
        type: Date
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other']
    },
    contactNumber: {
        type: String
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    parentName: {
        type: String
    },
    parentContact: {
        type: String
    },
    class: {
        type: String,  // e.g., "10th Grade", "BS CS 1st Semester"
        required: true
    },
    section: {
        type: String  // e.g., "A", "B"
    },
    rollNumber: {
        type: String,
        unique: true,
        sparse: true
    },
    admissionDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'graduated', 'suspended'],
        default: 'active'
    },
    profilePicture: {
        type: String  // URL to image
    }
}, {
    timestamps: true
});

// Virtual for full name from User model (will be populated)
StudentSchema.virtual('fullName').get(function() {
    return this.userId ? `${this.userId.firstName} ${this.userId.lastName}` : '';
});

module.exports = mongoose.model('Student', StudentSchema);