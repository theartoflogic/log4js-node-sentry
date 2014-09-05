'use strict';

var raven = require('raven');
var layouts = require('log4js').layouts;

/**
 * The appender function.
 *
 * @param  {String}   The Sentry URL to post events to.
 *
 * @return {Function} Returns the
 */
function sentryAppender(url, layout) {

    // Create a new instance of the client
    var client = new raven.Client(url);

    layout = layout || layouts.messagePassThroughLayout;

    return function(logEvent) {

        // Format the log message
        var message = layout(logEvent);

        // Forward the message to Sentry
        client.captureMessage(message, {
            level: logEvent.level.toString().toLowerCase()
        });

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

    return sentryAppender(config.url, layout);
}

exports.appender = sentryAppender;
exports.configure = configure;
