var serialPort = require('serialport');
var SerialPort = require('serialport').SerialPort;
var arduinoPort;
var connected = false;
var tag = '[Arduino] ';

// TODO 에러 처리
init();

function init() {
    getArduinoSerialComName(function(err, comName) {
        if (err) {
            console.warn(tag + "Fail to get arduino port name");
        } else {
            connectToArduino(comName, function(err, arduino) {
                if (err) {
                    console.error(tag + "Fail to connect to arduino : " + comName);
                } else if (typeof arduino === "object") {
                    arduinoPort = arduino;
                    connected = true;
                }
            });
        }
    });
}

function connectToArduino(comName, cb) {
    var arduino = new SerialPort(comName, {
        baudrate: 9600,
        dataBits: 8,
        parity: 'none',
        stopBits: 1,
        flowControl: false
    });

    arduino.on('open', function() {
        console.log(tag + 'port is opened.');
        arduino.on('data', function(data) {
            console.log(tag + 'data received: ' + data);
        });
        arduino.write('Hello from Raspberry Pi\n', function(err, results) {
            console.log(tag + 'err ' + err);
            console.log(tag + 'results ' + results);
        });

        cb(null, arduino);
    });
}

function sendMessage(message, cb) {
    if (arduinoPort.isOpen()) {
        arduinoPort.write(message + '\n', function(err, results) {
            console.log(tag + 'send message - err ' + err);
            console.log(tag + 'send message - results ' + results);
            if (typeof cb === 'function') cb(err, results);
        });
    } else {
        if (typeof cb === 'function') cb('Arduino is not ready.');
    }
}

function getArduinoSerialComName(callback) {
    serialPort.list(function(err, ports) {
        if (err) {
            console.log(tag + err);
            callback(err);
            return;
        }

        ports.forEach(function(port) {
            if (typeof port.manufacturer === 'string' && port.manufacturer.toLowerCase().indexOf('arduino') > -1) {
                if (typeof callback === 'function') {
                    callback(null, port.comName);
                    return;
                }
            }
        });
    });
}

function printSerialPorts() {
    serialPort.list(function(err, ports) {
        ports.forEach(function(port) {
            console.log('comName : ' + port.comName);
            console.log('pnpId : ' + port.pnpId);
            console.log('manufacturer : ' + port.manufacturer);
        });
    });
};

exports.sendMessage = sendMessage;