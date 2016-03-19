'use strict'

var raven = require('raven');
var layouts = require('log4js').layouts;
var util = require('util');

var LEVEL_MAP = {
  debug: 'debug',
  info: 'info',
  warn: 'warning',
  error: 'error',
  fatal: 'fatal'
};

exports.appender = sentryAppender;
exports.configure = configure;

/**
 * The appender function.
 *
 * @param {String} dsn The Sentry URL to post events to.
 * @param {String} layout The layout to use to format the message.
 * @param {String} level The log level to use as an override for the main category level.
 *
 * @return {Function} Returns the
 */
function sentryAppender(client, layout, level) {

    layout = layout || simpleLayout;

    return function(logEvent) {
        // Check if the log level is enabled
        if (level && !logEvent.level.isGreaterThanOrEqualTo(level)) return;

        // Format the log message
        var message = layout(logEvent);

        var kwargs = {};
        kwargs.level = LEVEL_MAP[logEvent.level.toString().toLowerCase()];
        kwargs.logger = logEvent.categoryName

        var data = logEvent.data;
        var requests = data.filter(isRequest);
        if (requests.length) raven.parsers.parseRequest(requests[0], kwargs);
        if (data.length > 1) kwargs.logentry = {
            message: data[0],
            params: data.slice(1)
        }

        var errors = data.filter(function(it) { return it instanceof Error });
        if (errors.length) {
            kwargs.message = message;
            // Forward the error to Sentry
            client.captureException(errors[0], kwargs);
        } else {
            // Forward the message to Sentry
            client.captureMessage(message, kwargs);
        }
    }
}

/**
 * Configures the appender.
 *
 * @param  {Object} config The options to apply.
 *
 * @return {Function} Returns the response from the sentryAppender() function.
 */
function configure(config) {
    var layout;
    if (config.layout) {
        layout = layouts.layout(config.layout.type, config.layout);
    }
    var options = {
        release: config.release
    };
    var client = new raven.Client(config.dsn, options);
    return sentryAppender(client, layout, config.level)
}

function simpleLayout(loggingEvent) {
    var logData = loggingEvent.data;
    var data = Array.isArray(logData) ? logData : Array.prototype.slice.call(arguments);
    return util.format.apply(util, data)
}

function isRequest(obj) {
    return obj && obj.method && (obj.originalUrl || obj.url)
}
