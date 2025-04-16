const { check, param } = require('express-validator');
const mongoose = require('mongoose');

const validateGenerateReq = [
    check('mess_id').notEmpty().withMessage('Messenger Id is required'),
    check('first_name').notEmpty().withMessage('First Name is required'),
    check('last_name').notEmpty().withMessage('Last Nam is required'),
    check('sex').notEmpty().withMessage('Gender is required'),
    check('profile_pic_url').notEmpty().withMessage('Profile Picture is required'),
    check('origin_img').notEmpty().withMessage('Origin Image is required'),
    check('profession').notEmpty().withMessage('Profession is required'),
    check('wish').notEmpty().withMessage('Wish is required'),
    check('newyear_style').notEmpty().withMessage('Newyear Style is required')
  ];
  const validateShowReq = [
    param('mess_id').notEmpty().withMessage('Messenger Id is required'),
    param('jobId').notEmpty().withMessage('jobId is required'),
    param('jobId').custom(value => mongoose.Types.ObjectId.isValid(value)).withMessage('jobId must be a valid MongoDB ObjectId')
  ];

  module.exports = {validateGenerateReq, validateShowReq};