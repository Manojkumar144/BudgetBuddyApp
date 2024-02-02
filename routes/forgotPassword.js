const express = require('express');
const router = express.Router();

const forgotPasswordController = require('../controllers/forgotPasswordController');

// Route for displaying the forgot password page
router.get('/forgotpassword', forgotPasswordController.forgetPassPage);

// Route for handling the forgot password form submission (POST request)
router.post('/forgotpassword', forgotPasswordController.forgotPassword);

router.get('/resetpassword/:id', forgotPasswordController.resetPassword)

router.get('/updatepassword/:id',forgotPasswordController.updatePassword)

module.exports = router;
