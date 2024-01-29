require('dotenv').config(); // to utilize the environment variable in .env file 
const User = require('../models/user');
const Expense = require('../models/expense');
const Sequelize = require('sequelize');
const sequelize = require('../util/database');

exports.getLeaderboardDetails = async (req, res) => {
    try {
      const leaderboardData = await User.findAll({
        attributes: ['id', 'name', [Sequelize.fn('SUM', Sequelize.col('Expenses.totalexpenses')), 'totalExpenses']],
        include: [
          {
            model: Expense,
            attributes: [],
            duplicating: false,
          },
        ],
        group: ['User.id', 'name'],
        order: [
          [Sequelize.fn('SUM', Sequelize.col('Expenses.totalexpenses')), 'ASC'],
        ],
      });
  
      // Send the leaderboard data as JSON response
      res.status(200).json({ leaderboardData });
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };