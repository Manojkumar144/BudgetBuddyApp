const Sequelize = require('sequelize');

const sequelize = new Sequelize('expense', 'root', 'Sql@9944',{
    dialect: 'mysql',
    host: 'localhost',
    port: 3307
})

module.exports = sequelize;