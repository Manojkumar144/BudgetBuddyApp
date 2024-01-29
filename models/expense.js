const Sequelize = require('sequelize');
const sequelize = require('../util/database');
const User = require('../models/user');
const Expense = sequelize.define('expense', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false,  
    },
    category: {
        type: Sequelize.STRING,
        allowNull: false
    },
    totalexpenses: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
    },
});


module.exports = Expense;
