const express = require('express');
const seriesRouter = express.Router();
module.exports = seriesRouter;

const sqlite = require('sqlite3');
const db = new sqlite.Database(process.env.TEST_DATABASE || './database.sqlite');

const issuesRouter = require('./issues.js');
seriesRouter.use('/:seriesId/issues', issuesRouter);

//series id params
seriesRouter.param('seriesId', (req, res, next, seriesId) => {
  db.get(`SELECT * FROM Series WHERE Series.id = $seriesId`, {$seriesId: seriesId}, (err, series) => {
    if(err) {
      throw err;
    } else if (series) {
      req.series = series;
      next();
    } else {
      res.status(404).send();
    }
  });
});

//get all series from DB
seriesRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Series', (error, series) => {
    if (error) {
      throw error;
    } else {
      res.status(200).json({series: series});
    }
  });
});

//get series by id
seriesRouter.get('/:seriesId', (req, res, next) => {
  res.status(200).json({series: req.series});
});


// post a new series
seriesRouter.post('/', (req, res, next) => {
  const name = req.body.series.name;
  const description = req.body.series.description;
  if (!name || !description) {
    return res.status(400).send();
  }

  const sql = 'INSERT INTO Series (name, description) VALUES ($name, $description)';
  const values = {
    $name : name,
    $description: description
  };

  db.run(sql, values, function(err) {
        if(err) {
          throw err;
        } else {
          db.get(`SELECT * FROM Series WHERE Series.id = ${this.lastID}`, (err, series) => {
            res.status(201).json({series: series});
          });
        }
    }
  );
});


// update a series
seriesRouter.put('/:seriesId', (req, res, next) => {
  const name = req.body.series.name;
  const description = req.body.series.description;
  if (!name || !description) {
    return res.status(400).send();
  }
  const sql = 'UPDATE Series SET name = $name, description = $description WHERE Series.id = $seriesId';
  const values = {
    $seriesId : req.params.seriesId,
    $name : name,
    $description : description
  };
  db.run(sql, values, function(err) {
    if (err) {
      throw err;
    } else {
      db.get(`SELECT * FROM Series WHERE Series.id = ${req.params.seriesId}`, (err, series) => {
        res.status(200).json({series: series});
      });
    }
  });
});

//delete a series
seriesRouter.delete('/:seriesId', (req, res, next) => {
  const issueSql = 'SELECT * FROM Issue WHERE Issue.series_id = $seriesId';
  const issueValues = { $seriesId : req.params.seriesId};
  db.get(issueSql, issueValues, (err, issue) => {
    if (err) {
      throw err;
    } else if (issue) {
      res.status(400).send();
    } else {
      const sql = 'DELETE FROM Series WHERE Series.id = $seriesId';
      const values = {
        $seriesId : req.params.seriesId
      };
      db.run(sql, values, function(err) {
        if (err) {
          throw err;
        } else {
          res.status(204).send();
        }
      });
    }
  });
});
