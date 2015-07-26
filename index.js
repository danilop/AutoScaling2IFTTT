console.log('Loading function');

var https = require('https');
var querystring = require("querystring");

// IFTTT Maker Configuration, see https://ifttt.com/maker for more info
var iftttMakerBaseEventName = 'autoscaling'
var iftttMakerSecretKey = '<YOUR IFTTT MAKER SECRET KEY>';

exports.handler = function(event, context) {
    var messageText = event.Records[0].Sns.Message;
    console.log('From SNS:', messageText);

    var message = JSON.parse(messageText);
    
    var autoScalingGroupName = message.AutoScalingGroupName;
    // To remove "autoscaling:" at the beginning
    var autoScalingEvent = message.Event.slice(12);
    
    var iftttMakerEventName =
        iftttMakerBaseEventName + '_'
        + autoScalingGroupName + '_'
        + autoScalingEvent;
    
    console.log("EventName: ", iftttMakerEventName);
    
    var iftttMakerUrl =
        'https://maker.ifttt.com/trigger/'
        + iftttMakerEventName
        + '/with/key/'
        + iftttMakerSecretKey;

    var params = querystring.stringify({
            value1: autoScalingGroupName,
            value2: autoScalingEvent
        });

    https.get(encodeURI(iftttMakerUrl) + '?' + params, function(res) {
        console.log("Got response: " + res.statusCode);
        res.setEncoding('utf8');
        res.on('data', function(d) {
            console.log('Body: ' + d);
        });
        context.succeed(res.statusCode);
    }).on('error', function(e) {
        console.log("Got error: " + e.message);
        context.fail(e.message);
    });

};
