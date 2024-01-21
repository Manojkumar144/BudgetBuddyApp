const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// api to handle creation of user details
router.post('/signUp', userController.postAddUser);

//api to handle the login form
router.post('/loginUser', userController.postLoginUser);

//api to add expense 
router.post('/add-expense', userController.postAddExpense);

router.get('/api/expense', userController.getExpenseDetails);

// API to handle expense update
router.put('/api/expense/:id', userController.updateExpense);

// API to handle expense deletion
router.delete('/api/expense/:id', userController.deleteExpense);

module.exports = router;
