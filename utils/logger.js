const config = require('config');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize } = format;
const dailyRotateFile = require('winston-daily-rotate-file');
require('date-utils');

/**
 * 로그 포멧 설정
 */
const logFormat = printf(info => {
	return `${info.timestamp} ${info.level} : ${info.message}`;
});

/**
 * logger를 위한 winston 포멧 설정
 * 콘솔과 하루 단위의 error/info rolling 설정
 */
exports.logger = createLogger ({
	format : combine( 
        colorize(), 
        timestamp(), 
        logFormat 
    ),
    transports: [
        new (transports.Console)({
            name: 'consoleLog',
            colorize: true,
            timestamp: function () {
                return new Date().toFormat('YYYY-MM-DD HH24:MI:SS')
            },
            json: false
        }),
        new (transports.DailyRotateFile)({
            name: 'dailyInfoLog',
            level: 'info',
            filename: `${config.get("logger").get('path')}/daily-info`,
            timestamp: function () {
                return new Date().toFormat('YYYY-MM-DD HH24:MI:SS')
            },
            datePattern: 'YYYYMMDD',
            json: false
        }),
        new (transports.DailyRotateFile)({
            name: 'dailyErrorLog',
            level: 'error',
            filename: `${config.get("logger").get('path')}/daily-error`,
            timestamp: function () {
                return new Date().toFormat('YYYY-MM-DD HH24:MI:SS')
            },
            datePattern: 'YYYYMMDD',
            json: false
        })
    ]
});