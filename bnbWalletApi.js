#!/usr/bin/env node

const app = require('./app');
const debug = require('debug')('bnb:server');
const http = require('http');
const bnbReceive = require('./service/bnbReceive');

/**
 * default 3000이 아닌 8080포트 열기
 */
let port = normalizePort(process.env.PORT || '8080');
app.set('port', port);

/**
 * create server
 */
let server = http.createServer(app);

/**
 * port 설정
 * @param val
 * @returns boolean
 */
function normalizePort(val) {
	let port = parseInt(val, 10);
	if(isNaN(port)) {
		return val;
	}
	
	if(port >= 0) {
		return port;
	}
	return false;
}

/**
 * server 설정
 */
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * 서버 에러 이벤트 처리를 위한 리스너 함수
 */
function onError(error) {
	if(error.syscall !== 'listen') {
		throw error;
	}

	let bind = typeof port === 'string'
		? 'Pipe ' + port
		: 'Port ' + port;

	switch(error.code) {
		case 'EACCES':
			console.error(bind + ' requires elevated privileges');
			process.exit(1);
			break;
		case 'EADDRINUSE':
			console.error(bind + ' is already in use');
			process.exit(1);
			break;
		default:
			throw error;
	}
}

/**
 * 서버 리스닝 이벤트 처리를 위한 리스너 함수
 */
function onListening() {
	let addr = server.address();
	let bind = typeof addr === 'string'
		? 'pipe ' + addr
		: 'port ' + addr.port;
	debug('Listening on ' + bind);
}
