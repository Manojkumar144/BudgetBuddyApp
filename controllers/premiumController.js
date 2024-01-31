require('dotenv').config(); // to utilize the environment variable in .env file 
const User = require('../models/user');
const path =require('path');

exports.getLeaderboardDetails = async (req, res) => {
   
  try{
    const leaderboardData = await User.findAll({
        order: [["totalExpenses", 'DESC']]   
    })

    res.status(200).json({leaderboardData})     
} catch (err){
console.log(err)
res.status(500).json(err)
}
  };

  exports.getLeaderboardPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../views', '/leaderboard.html'));
  };