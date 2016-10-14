const SerialPort = require('serialport');

const bluebird = require('bluebird');
const FLAG  = 0xFF
const TX = 0xFE
const RX = 0xFA
const debugTrans = require('debug')('T6603.TRANS');
const debug = require('debug')('T6603');

var Protocol = function (dev) {
    this.defer = null;
    this.busy = true;

    this.port = new SerialPort(dev, {
        baudRate: 19200,
        parser: (() => {
            let data = new Buffer(0);
            return (emitter, buffer) => {
                debugTrans('RX', buffer);
                data = Buffer.concat([data, buffer]);

                let index = -1;
                for (let i = 0; i < data.length - 2; i++) { // RX + LEN = 2
                    if (data[i] == FLAG && data[i + 1] == RX) {
                        index = i;
                        break;
                    }
                }

                if (index === -1) {
                    return;
                }

                let length = data[index + 2];
                let end = index + 3 + length;
                if (data.length < end) {
                    return;
                }

                let ret = data.slice(index + 3, end);
                data = data.slice(end);
                emitter.emit('data', ret);
            }
        })()
    });

    this.queue = [];

    this.port.on('open', () => {
        this.defer = null;
        this.busy = false;
        this._queueSend();
    });

    this.port.on('data', (data) => {
        this.defer.resolve(data);
        this.defer = null;
        this.busy = false;
        this._queueSend();
    });
};

Protocol.prototype.send = function (data, defer) {
    defer = defer || bluebird.defer();

    if (this.busy) {
        debug('enqueue', data);
        this.queue.push({
            data: data,
            defer: defer
        });
    } else {
        this.busy = true;
        this.defer = defer;
        data = Buffer.concat([new Buffer([FLAG, TX, data.length]), data]);
        debugTrans('TX', data);
        this.port.write(data, (err) => {
            if (err) {
                defer.reject(err);
            }
        });
    }

    return defer.promise;
};

Protocol.prototype._queueSend = function () {
    if (this.queue.length) {
        let request = this.queue.shift();
        debug('dequeue', request.data);
        this.send(request.data, request.defer);
    }
};

module.exports = Protocol;
