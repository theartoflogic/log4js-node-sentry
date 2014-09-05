Sentry Appender for log4js
---

This is a simple appender for log4js to send log messages to Sentry.

## Installation
```
$ npm install log4js-node-sentry
```

## Basic Usage
```javascript
var log4js = require('log4js');

// Configure log4js
log4js.configure({
    appenders: [
        {
            type:       'log4js-node-sentry',
            dsn:        '{{ YOUR SENTRY DSN }}',
            category:   'sentry'
        }
    ],
    levels: {
        sentry: 'ERROR'
    }
});

// Get the logger
var logger = log4js.getLogger('sentry');

// Send an error to Sentry
logger.error('This is a test.');
```
