const express = require('express');
const app = express();
const sqlite3 = require('sqlite3');
const cors = require('cors');

const PORT = process.env.PORT || 4000;


app.use(express.static('public'));

// import sql
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

//body parsing
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(cors());

//API router
const apiRouter = require('./api/api');
app.use('/api', apiRouter);

// start the server listening at PORT
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
module.exports = app;
