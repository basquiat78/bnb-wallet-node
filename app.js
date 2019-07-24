const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const index = require('./routes/index');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

/**
 * express router 설정
 */

/**
 * common controller
 * @param req
 * @param res
 * @param next
 * @returns
 */
app.use('/', index);

/**
 * bad request handler
 * @param req
 * @param res
 * @param next
 * @returns
 */
app.use(function(req, res, next) {
	let err = new Error('Not Found');
	err.status = 404;
	res.send( {error: err.status } );
});

/**
 * error handler
 * @param err
 * @param req
 * @param res
 * @param next
 * @returns
 */
app.use(function(err, req, res, next) {
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};
	res.status(err.status || 500);
	res.send({error: err.status });
});

module.exports = app;
