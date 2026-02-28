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

module.exports = {
  validateStudent
};