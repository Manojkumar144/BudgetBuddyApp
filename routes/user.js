const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateMiddleware = require('../middleware/auth');

// api to handle creation of user details
router.post('/signUp', userController.postAddUser);

//api to handle the login form
router.post('/dashboard',userController.postLoginUser);

//api to add expense 
router.post('/add-expense',authenticateMiddleware.authenticateToken, userController.postAddExpense);

router.get('/api/expense',authenticateMiddleware.authenticateToken, userController.getExpenseDetails);

// API to handle expense update
router.put('/api/expense/:id',authenticateMiddleware.authenticateToken, userController.updateExpense);

// API to handle expense deletion
router.delete('/api/expense/:id',authenticateMiddleware.authenticateToken, userController.deleteExpense);

router.get('/dashboard', userController.getDashboard);

router.get('/download', userController.getDownload);

module.exports = router;
