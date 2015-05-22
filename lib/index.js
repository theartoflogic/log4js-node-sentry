'use strict';

var raven = require('raven');
var layouts = require('log4js').layouts;

/**
 * The appender function.
 *
 * @param {String} dsn The Sentry URL to post events to.
 * @param {String} layout The layout to use to format the message.
 * @param {String} level The log level to use as an override for the main category level.
 *
 * @return {Function} Returns the
 */
function sentryAppender(dsn, layout, level) {

    // Create a new instance of the client
    var client = new raven.Client(dsn);

    layout = layout || layouts.messagePassThroughLayout;

    return function(logEvent) {

        // Check if the log level is enabled
        if (!level || logEvent.level.isGreaterThanOrEqualTo(level)) {

            // Format the log message
            var message = layout(logEvent);

            console.log('Message:', message);

            // Forward the message to Sentry
            client.captureMessage(message, {
                level: logEvent.level.toString().toLowerCase()
            });

        }

    };
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

    return sentryAppender(config.dsn, layout, config.level);
}

exports.appender = sentryAppender;
exports.configure = configure;