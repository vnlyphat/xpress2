const express = require('express');
const issuesRouter = express.Router({mergeParams: true});

const sqlite = require('sqlite3');
const db = new sqlite.Database(process.env.TEST_DATABASE || './database.sqlite');

module.exports = issuesRouter;

//issues id params
issuesRouter.param('issueId', (req, res, next, issueId) => {
  db.get(`SELECT * FROM Issue WHERE Issue.id = $issueId`, {$issueId: issueId}, (err, issue) => {
    if(err) {
      throw err;
    } else if (issue) {
      req.issue = issue;
      next();
    } else {
      res.status(404).send();
    }
  });
});


//get all issues from DB
issuesRouter.get('/', (req, res, next) => {
  const sql = 'SELECT * FROM Issue WHERE Issue.series_id = $seriesId';
  const values = {$seriesId : req.params.seriesId}
  db.all(sql, values, (error, issues) => {
    if (error) {
      throw error;
    } else {
      res.status(200).json({issues: issues});
    }
  });
});

//post a new issue
issuesRouter.post('/', (req, res, next) => {
  const name = req.body.issue.name;
  const issueNumber = req.body.issue.issueNumber;
  const publicationDate = req.body.issue.publicationDate;
  const artistId = req.body.issue.artistId;

  const artistSql = 'SELECT * FROM Artist WHERE Artist.id = $artistId';
  const artistValues = {$artistId : artistId};
  db.get(artistSql, artistValues, (err, artist) => {
    if (err) {
      throw err;
    } else {
      if (!name || !issueNumber || !publicationDate || !artistId) {
        return res.status(400).send();
      }

      const sql = 'INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id) VALUES ($name, $issueNumber, $publicationDate, $artistId, $seriesId)';
      const values = {
        $name : name,
        $issueNumber : issueNumber,
        $publicationDate : publicationDate,
        $artistId : artistId,
        $seriesId : req.params.seriesId
      };
      db.run(sql, values, function(err) {
        if(err) {
          throw err;
        } else {
          db.get(`SELECT * FROM Issue WHERE Issue.id = ${this.lastID}`, (err, issue) => {
            res.status(201).json({issue: issue});
          });
        }
      });
    }
  });
});


// update an issue
issuesRouter.put('/:issueId', (req, res, next) => {
  const name = req.body.issue.name;
  const issueNumber = req.body.issue.issueNumber;
  const publicationDate = req.body.issue.publicationDate;
  const artistId = req.body.issue.artistId;

  const artistSql = 'SELECT * FROM Artist WHERE Artist.id = $artistId';
  const artistValues = {$artistId : artistId};
  db.get(artistSql, artistValues, (err, artist) => {
    if (err) {
      throw err;
    } else {
      if (!name || !issueNumber || !publicationDate || !artistId) {
        return res.status(400).send();
      }
      const sql = 'UPDATE Issue SET name = $name, issue_number = $issueNumber, publication_date = $publicationDate, artist_id = $artistId WHERE Issue.id = $issueId';
      const values = {
        $name : name,
        $issueNumber : issueNumber,
        $publicationDate : publicationDate,
        $artistId : artistId,
        $issueId : req.params.issueId
      };
      db.run(sql, values, function(err) {
        if (err) {
          throw err;
        } else {
          db.get(`SELECT * FROM Issue WHERE Issue.id = ${req.params.issueId}`, (err, issue) => {
            res.status(200).json({issue: issue});
          });
        }
      });
    }
  });
});

//delete an issue
issuesRouter.delete('/:issueId', (req, res, next) => {
  const sql = 'DELETE FROM Issue WHERE Issue.id = $issueId';
  const values = {
    $issueId : req.params.issueId
  };
  db.run(sql, values, (err) => {
    if (err) {
      throw err;
    } else {
      res.status(204).send();
    }
  });
});
