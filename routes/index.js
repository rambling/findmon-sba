var express = require('express');
var router = express.Router();
var arduino = require('../lib/arduino');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'Findmon - 2015 SBA IoT Hackathon'
    });
});

router.get('/arduino/display', function(req, res, next) {
	var message = req.param("message");

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
    console.info('[NFC] lat: ' + lat + " | lon: " + lon);
    res.send(200);
});

module.exports = router;