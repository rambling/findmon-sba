var express = require('express');
var request = require('request');
var router = express.Router();
var arduino = require('../lib/arduino');
var poleInfo = require('../device-info.json');

var rest = {
    getDirection: 'http://findmon.asuscomm.com:58081/information/getDirection.mon?poleId={poleId}&endX={endX}&endY={endY}'
};

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'Findmon - 2015 SBA IoT Hackathon'
    });
});

router.get('/arduino/display', function(req, res, next) {
    var message = req.param('message');

    arduino.sendMessage(message, function(err, results) {
        res.render('arduinoRes', {
            title: 'Arduino Response',
            error: err,
            results: results
        });
    });
});

router.get('/arduino/location', function(req, res, next) {
    var lat = req.param('lat');
    var lon = req.param('lon');
    console.info('[NFC] lat: ' + lat + ' | lon: ' + lon);
    res.send(200);

    getDirectionInfo(lat, lon, function(err, results) {
        if (!err) {
            console.dir(results);

            var direction;
            var remainingMin = Math.round(results.totalTime / 60);
            var additionalInfo = "(" + results.compasLoc + ") " + results.totalDistance + "m " + remainingMin + "min";

            if ( 0 < results.degree < 180 ) {
            	direction = "LEFT" + additionalInfo;
            } else if (180 < results.degree < 360) {
            	direction = "RIGHT" + additionalInfo;
            } else if ( results.degree === 0 || results.degree === 360) {
            	direction = "BACK" + additionalInfo;
            } else if (results.degree === 180) {
            	direction = "FORWARD" + additionalInfo;
            } else {
            	direction = "UNKNOWN";
            }
            arduino.sendMessage(direction);
        } else {
            arduino.sendMessage('Sorry.');
        }
    });
});

module.exports = router;

function getDirectionInfo(lat, lon, cb) {
    var url = rest.getDirection;
    url = url.replace('{poleId}', poleInfo.id || 'p1');
    url = url.replace('{endX}', lon);
    url = url.replace('{endY}', lat);

    console.log(url);

    request({url:url, method: 'GET', json:true}, function(error, response, body) {
        if (!error && response.statusCode == 200) {
        	// console.dir(response);
            cb(null, body);
        } else {
            cb('HTTP error');
        }
    })
}