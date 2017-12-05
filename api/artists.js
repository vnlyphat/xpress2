const artistsRouter = require('express').Router();
module.exports = artistsRouter;

const sqlite = require('sqlite3');
const db = new sqlite.Database(process.env.TEST_DATABASE || './database.sqlite');


//artist id params

artistsRouter.param('artistId', (req, res, next, artistId) => {
  db.get(`SELECT * FROM Artist WHERE Artist.id = $artistId`, {$artistId: artistId}, (err, artist) => {
    if(err) {
      throw err;
    } else if (artist) {
      req.artist = artist;
      next();
    } else {
      res.status(404).send();
    }
  });
});



//get all artist from DB
artistsRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Artist WHERE is_currently_employed = 1', (error, artists) => {
    if (error) {
      throw error;
    } else {
      res.status(200).json({artists: artists});
    }
  });
});

//get artist by id
artistsRouter.get('/:artistId', (req, res, next) => {
  res.status(200).json({artist: req.artist});
});


// post a new artist
artistsRouter.post('/', (req, res, next) => {
  const name = req.body.artist.name;
  const dateOfBirth = req.body.artist.dateOfBirth;
  const biography = req.body.artist.biography;
  const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;
  if (!name || !dateOfBirth || !biography) {
    return res.status(400).send();
  }
  db.run(
    'INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed) VALUES ($name, $dateOfBirth, $biography, $isCurrentlyEmployed)',
    {
      $name : name,
      $dateOfBirth : dateOfBirth,
      $biography : biography,
      $isCurrentlyEmployed : isCurrentlyEmployed
    },
    function(err) {
        if(err) {
          throw err;
        } else {
          db.get(`SELECT * FROM Artist WHERE Artist.id = ${this.lastID}`, (err, artist) => {
            res.status(201).json({artist: artist});
          });
        }
    }
  );
});


// update an artist
artistsRouter.put('/:artistId', (req, res, next) => {
  const name = req.body.artist.name;
  const dateOfBirth = req.body.artist.dateOfBirth;
  const biography = req.body.artist.biography;
  const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;
  if (!name || !dateOfBirth || !biography) {
    return res.status(400).send();
  }
  const sql = 'UPDATE Artist SET name = $name, date_of_birth = $dateOfBirth, biography = $biography, is_currently_employed = $isCurrentlyEmployed WHERE Artist.id = $artistId';
  const values = {
    $artistId : req.params.artistId,
    $name : name,
    $dateOfBirth : dateOfBirth,
    $biography : biography,
    $isCurrentlyEmployed : isCurrentlyEmployed
  };
  db.run(sql, values, function(err) {
    if (err) {
      throw err;
    } else {
      db.get(`SELECT * FROM Artist WHERE Artist.id = ${req.params.artistId}`, (err, artist) => {
        res.status(200).json({artist: artist});
      });
    }
  });
});

//delete an artist
artistsRouter.delete('/:artistId', (req, res, next) => {
  const sql = 'UPDATE Artist SET is_currently_employed = 0 WHERE Artist.id = $artistId';
  const values = {
    $artistId : req.params.artistId,
  };
  db.run(sql, values, function(err) {
    if (err) {
      throw err;
    } else {
      db.get(`SELECT * FROM Artist WHERE Artist.id = ${req.params.artistId}`, (err, artist) => {
        res.status(200).json({artist: artist});
      });
    }
  });
});
