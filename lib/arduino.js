var serialPort = require('serialport');
var SerialPort = require('serialport').SerialPort;
var arduinoPort;
var connected = false;
var tag = '[Arduino] ';

// 5초마다 포트 상태 확인 및 연결
setInterval(function() {
    connectToArduino();
}, 5000);

function connectToArduino() {
    if (typeof arduinoPort === 'object' && typeof arduinoPort.isOpen === 'function' && arduinoPort.isOpen()) {
        //console.log(tag + "Port is already opened. Do nothing.");
        return;
    }

    getArduinoSerialComName(function(err, comName) {
        if (err) {
            console.warn(tag + "Fail to get arduino port name. - " + new Date().toString());
            return;
        }

        arduinoPort = new SerialPort(comName, {
            baudrate: 9600,
            dataBits: 8,
            parity: 'none',
            stopBits: 1,
            flowControl: false
        });

        arduinoPort.on('open', function() {
            console.log(tag + 'port is opened. ' + new Date().toString());
            ready = true; // Change the status
            arduinoPort.on('data', function(data) {
                console.log(tag + 'data received: ' + data);
            });
            arduinoPort.on('disconnect', function() {
                console.log(tag + 'port is disconnected. ' + new Date().toString() );
                ready = false; // Change the status
            });
        });
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