const { body, validationResult } = require('express-validator');
const { BadRequestError } = require('../errors');

const validateStudent = [
  body('firstName').notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
  
  body('lastName').notEmpty().withMessage('Last name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
  
  body('email').isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  
  body('class').notEmpty().withMessage('Class is required'),
  
  body('contactNumber').optional().isMobilePhone().withMessage('Valid contact number required'),
  
  body('rollNumber').optional().isAlphanumeric().withMessage('Roll number must be alphanumeric'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError(errors.array()[0].msg);
    }
    next();
  }
];
const validateTeacher = [
  body('firstName').notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
  
  body('lastName').notEmpty().withMessage('Last name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
  
  body('email').isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  
  body('employeeId').notEmpty().withMessage('Employee ID is required')
    .isAlphanumeric().withMessage('Employee ID must be alphanumeric'),
  
  body('qualification').notEmpty().withMessage('Qualification is required'),
  
  body('specialization').notEmpty().withMessage('Specialization is required'),
  
  body('contactNumber').notEmpty().withMessage('Contact number is required')
    .isMobilePhone().withMessage('Valid contact number required'),
  
  body('experience').optional().isInt({ min: 0 }).withMessage('Experience must be a positive number'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new BadRequestError(errors.array()[0].msg);
    }
    next();
  }
];

module.exports = {
  validateStudent,
  validateTeacher
};