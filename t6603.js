const Protocol = require('./protocol');

const CMD_READ = 0x02;
const CMD_UPDATE = 0x03;
const CMD_STATUS = 0xB6;
const CMD_IDLE = 0xB9;

const CO2_PPM = 0x03;
const SERIL  = 0x01;
const ELEVATION = 0x0F;

var T6603 = function (dev) {
    this.protocol = new Protocol(dev);
};

T6603.prototype.read = function (type) {
    return this.protocol.send(new Buffer([
        CMD_READ,
        type
    ])).then(data => data[0] * 256 + data[1]);
};

T6603.prototype.status = function () {
    return this.protocol.send(new Buffer([
        CMD_STATUS
    ])).then(data => data[0]);
};

module.exports = T6603;
