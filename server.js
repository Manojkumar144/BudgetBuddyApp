const path = require('path');
const express = require('express');
const sequelize = require('./util/database');

const app = express();
const port = 3000;

app.set('views', 'views');

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/user'));

app.get('/', async (req, res) => {
  try {
    res.sendFile(path.join(__dirname, './views', 'index.html'))

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

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
