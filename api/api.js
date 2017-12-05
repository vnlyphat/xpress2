const express = require('express');
const apiRouter = express.Router();

//import files
const artistsRouter = require('./artists');
const seriesRouter = require('./series');

apiRouter.use('/artists', artistsRouter);
apiRouter.use('/series', seriesRouter);

module.exports = apiRouter;
