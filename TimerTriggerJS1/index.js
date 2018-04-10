const
    http_request = require('./lib/http_request');

module.exports = function (context, myTimer) {
    var timeStamp = new Date().toISOString().toString(),
        environment_config = {
            preprod: {
                tracer: 'Azure_TEST2-Non_Prod',
                name: 'Azure Shared Services Non-Prod Compass Alarm Tracer',
                hostname: 'api.alarms.monitor.azure.compass-stage.thomsonreuters.com',
                path: '/alarm-ingest',
                key: 'f6478c51b2734b49a438fefcea8c77da'
            },
            prod: {
                tracer: 'Azure_Shared_Services-Production',
                name: 'Azure Shared Services Production Compass Alarm Tracer',
                hostname: 'api.alarms.monitor.azure.compass-stage.thomsonreuters.com',
                path: '/alarm-ingest',
                key: 'NOTSET'
            }
        },
        tracer_config = {},
        options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        },
        env_label;
    if (process.env.hasOwnProperty('WEBSITE_SLOT_NAME')) {
        env_label = process.env['WEBSITE_SLOT_NAME'].toLowerCase();
    } else {
        throw new Error('Could not get slot from env variable: WEBSITE_SLOT_NAME in ', process.env);
    }
    if (environment_config[env_label]) {
        tracer_config = environment_config[env_label];
    } else {
        throw new Error('Could match an environment config from the given slot', env_label);
    }

    var stringified_tracer = JSON.stringify({
        reporter: 'Azure',
        status: 'OK',
        end_point_id: '203773',
        alarm_type: 'application',
        message: 'Compass Alarms tracer for ' + tracer_config.name,
        category: 'COMPASS ALARMS TRACER:' + tracer_config.tracer,
        informer: 'send_tracer_azure',
        occurred_at: timeStamp
    });

    options.headers['Content-Length'] = stringified_tracer.length;
    options.headers['Ocp-Apim-Subscription-Key'] =  tracer_config.key;
    options.path = tracer_config.path;
    options.hostname = tracer_config.hostname;
    context.log('sending [', env_label, '] tracer', stringified_tracer);
    return http_request(options, stringified_tracer, context);
};