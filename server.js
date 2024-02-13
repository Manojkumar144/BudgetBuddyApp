const dotenv =require("dotenv");
dotenv.config()
const path = require ('path');
const express = require('express');
const sequelize = require('./util/database');
const User = require('./models/user');
const Expense = require('./models/expense');
const Order = require('./models/order');
const Forgotpassword = require("./models/forgotpassword");
const helmet =require("helmet");
const morgan = require('morgan');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3001;

app.set('views', 'views');

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.json());

app.use('/', require('./routes/user'));
app.use('/', require('./routes/purchase'));
app.use('/', require('./routes/premium'));
app.use('/', require('./routes/forgotPassword'));

const accessLogStream =fs.createWriteStream(path.join(__dirname,'access.log'),{
  flags:'a'
});

app.use(helmet());
app.use(morgan('combined',{ stream: accessLogStream}));


app.get('/', async (req, res) => {
  try {
    res.sendFile(path.join(__dirname, './views', 'index.html'))

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(Forgotpassword);
Forgotpassword.belongsTo(User);

// Synchronize models with the database
sequelize.sync()
  .then(() => {
    console.log('Database synchronized');
    // Start the server after the database synchronization is complete
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Error synchronizing models with the database:', error);
  });