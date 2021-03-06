function Module() {
    this.tx_max_len = 36;
    this.tx_data = new Array(this.tx_max_len);

    this.sensor_data = {
        left_infared: 0,
        right_infared: 0,
        motion: 0,
        ultrasonic: 0,
        gas: 0,
        cds: 0,
        tmp: 0,
        vibe: 0,
    };

    this.worker_data = {
        tone: 0,
        buz_octave: 0,
        buz_note: 0,
        ultrasonic: 0,
        motion: 0,
        motor_state: 0,
        servo_angle: 0,
        neopixel: {
            first: {
                r: 0,
                g: 0,
                b: 0,
            },
            second: {
                r: 0,
                g: 0,
                b: 0,
            },
            third: {
                r: 0,
                g: 0,
                b: 0,
            },
            fourth: {
                r: 0,
                g: 0,
                b: 0,
            },
            fifth: {
                r: 0,
                g: 0,
                b: 0,
            },
            sixth: {
                r: 0,
                g: 0,
                b: 0,
            },
            seventh: {
                r: 0,
                g: 0,
                b: 0,
            },
            eighth: {
                r: 0,
                g: 0,
                b: 0,
            },
        },
        outer_left_motor: 0,
        outer_right_motor: 0,
    };

    this.sensorValueSize = {
        FLOAT: 2,
        SHORT: 3,
    };

    this.sensorTypes = {
        ALIVE: 0,
        DIGITAL: 1,
        ANALOG: 2,
        ULTRASONIC: 3,
        MOTION: 4,
        TIMER: 5,
    };
}

const NEOSPIDER = {
    TONE: 'tone',
    MOTOR_STATE: 'motorState',
    SERVO_ANGLE: 'servoAngle',
    ULTRASONIC: 'ultrasonic',
    MOTION: 'motion',
    NEOPIXEL: 'neopixel',
    OUTER_LEFT_MOTOR: 'outerLeftMotor',
    OUTER_RIGHT_MOTOR: 'outerRightMotor',
};

Module.prototype.init = function(handler, config) {};

Module.prototype.setSerialPort = function(sp) {
    this.sp = sp;
};

Module.prototype.requestInitialData = function() {
    const txData = this.tx_data;
    txData[0] = 0xff; // 시작 255
    txData[1] = 0x24; // 길이 36
    for (let i = 2; i < this.tx_max_len - 2; i++) {
        txData[i] = 0;
    }
    txData[34] = 0x0;
    txData[35] = 0xa;
    return txData;
};

Module.prototype.checkInitialData = function(data, config) {
    return true;
};

Module.prototype.afterConnect = function(that, cb) {
    that.connected = true;
    if (cb) {
        cb('connected');
    }
};

Module.prototype.validateLocalData = function(data) {
    return true;
};

/* 엔트리HW -> 엔트리JS */
Module.prototype.requestRemoteData = function(handler) {
    const sensorData = this.sensor_data;
    for (const key in sensorData) {
        handler.write(key, sensorData[key]);
    }
};

/** 엔트리JS -> 엔트리HW */
Module.prototype.handleRemoteData = function(handler) {
    const workerData = this.worker_data;
    let newValue;

    if (handler.e(NEOSPIDER.TONE)) {
        newValue = handler.read(NEOSPIDER.TONE);
        if (newValue.data) {
            const value = newValue.data.value;
            workerData.buz_octave = parseInt(value / 256, 10);
            workerData.buz_note = (value % 256);
        } else if (newValue === 0) {
            workerData.buz_octave = 0;
            workerData.buz_note = 0;
        } else {
            workerData.buz_octave = 0;
            workerData.buz_note = 0;
        }
    }

    if (handler.e(NEOSPIDER.MOTOR_STATE)) {
        newValue = handler.read(NEOSPIDER.MOTOR_STATE);

        if (workerData.motor_state != newValue) {
            workerData.motor_state = newValue;
        }
    }

    if (handler.e(NEOSPIDER.SERVO_ANGLE)) {
        newValue = handler.read(NEOSPIDER.SERVO_ANGLE);
        if (newValue == 0) {
            newValue = 90;
        } else if (newValue > 130) {
            newValue = 130;
        } else if (newValue < 50) {
            newValue = 50;
        }
        workerData.servo_angle = newValue;
    }

    if (handler.e(NEOSPIDER.ULTRASONIC)) {
        newValue = handler.read(NEOSPIDER.ULTRASONIC);
        workerData.ultrasonic = newValue;
    }

    if (handler.e(NEOSPIDER.MOTION)) {
        newValue = handler.read(NEOSPIDER.MOTION);
        workerData.motion = newValue;
    }

    if (handler.e(NEOSPIDER.NEOPIXEL)) {
        newValue = handler.read(NEOSPIDER.NEOPIXEL);
        if (newValue.data) {
            const red = newValue.data.red;
            const green = newValue.data.green;
            const blue = newValue.data.blue;
            const numAble = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth'];
            
            if (newValue.data.numStr) {
                const num = newValue.data.numStr;
    
                if (numAble.includes(num)) {
                    workerData.neopixel[num].r = red;
                    workerData.neopixel[num].g = green;
                    workerData.neopixel[num].b = blue;
                }
            } else {
                for (const able in numAble) {
                    workerData.neopixel[numAble[able]].r = red;
                    workerData.neopixel[numAble[able]].g = green;
                    workerData.neopixel[numAble[able]].b = blue;
                }
            }
        } else {
            workerData.neopixel.first.r = 0;
            workerData.neopixel.first.g = 0;
            workerData.neopixel.first.b = 0;
            workerData.neopixel.second.r = 0;
            workerData.neopixel.second.g = 0;
            workerData.neopixel.second.b = 0;
            workerData.neopixel.third.r = 0;
            workerData.neopixel.third.g = 0;
            workerData.neopixel.third.b = 0;
            workerData.neopixel.fourth.r = 0;
            workerData.neopixel.fourth.g = 0;
            workerData.neopixel.fourth.b = 0;
            workerData.neopixel.fifth.r = 0;
            workerData.neopixel.fifth.g = 0;
            workerData.neopixel.fifth.b = 0;
            workerData.neopixel.sixth.r = 0;
            workerData.neopixel.sixth.g = 0;
            workerData.neopixel.sixth.b = 0;
            workerData.neopixel.seventh.r = 0;
            workerData.neopixel.seventh.g = 0;
            workerData.neopixel.seventh.b = 0;
            workerData.neopixel.eighth.r = 0;
            workerData.neopixel.eighth.g = 0;
            workerData.neopixel.eighth.b = 0;
        }
    }

    if (handler.e(NEOSPIDER.OUTER_LEFT_MOTOR)) {
        newValue = handler.read(NEOSPIDER.OUTER_LEFT_MOTOR);
        workerData.outer_left_motor = newValue;
    }

    if (handler.e(NEOSPIDER.OUTER_RIGHT_MOTOR)) {
        newValue = handler.read(NEOSPIDER.OUTER_RIGHT_MOTOR);
        workerData.outer_right_motor = newValue;
    }

    this.worker_data = workerData;
};


/* 엔트리HW -> 교구 */
Module.prototype.requestLocalData = function() {
    const workerData = this.worker_data;
    const txData = this.tx_data;
    let checkSum = 0;
    const dataLen = 36;

    txData[0] = 0xff;
    txData[1] = 0x24;
    txData[2] = workerData.buz_octave;
    txData[3] = workerData.buz_note;
    txData[4] = workerData.ultrasonic;
    txData[5] = workerData.motion;
    txData[6] = workerData.motor_state;
    txData[7] = workerData.servo_angle;
    txData[8] = workerData.neopixel.first.r;
    txData[9] = workerData.neopixel.first.g;
    txData[10] = workerData.neopixel.first.b;
    txData[11] = workerData.neopixel.second.r;
    txData[12] = workerData.neopixel.second.g;
    txData[13] = workerData.neopixel.second.b;
    txData[14] = workerData.neopixel.third.r;
    txData[15] = workerData.neopixel.third.g;
    txData[16] = workerData.neopixel.third.b;
    txData[17] = workerData.neopixel.fourth.r;
    txData[18] = workerData.neopixel.fourth.g;
    txData[19] = workerData.neopixel.fourth.b;
    txData[20] = workerData.neopixel.fifth.r;
    txData[21] = workerData.neopixel.fifth.g;
    txData[22] = workerData.neopixel.fifth.b;
    txData[23] = workerData.neopixel.sixth.r;
    txData[24] = workerData.neopixel.sixth.g;
    txData[25] = workerData.neopixel.sixth.b;
    txData[26] = workerData.neopixel.seventh.r;
    txData[27] = workerData.neopixel.seventh.g;
    txData[28] = workerData.neopixel.seventh.b;
    txData[29] = workerData.neopixel.eighth.r;
    txData[30] = workerData.neopixel.eighth.g;
    txData[31] = workerData.neopixel.eighth.b;
    txData[32] = workerData.outer_left_motor;
    txData[33] = workerData.outer_right_motor;
    txData[35] = 0xa;

    for (let i = 2; i < dataLen - 2; i++) {
        checkSum += txData[i];
    }
    txData[dataLen - 2] = checkSum & 255;

    this.tx_data = txData;

    console.log(txData);

    return txData;
};

/* 교구 -> 엔트리HW */
Module.prototype.handleLocalData = function(data) {
    const datas = this.getDataByBuffer(data);
    const sensorData = this.sensor_data;

    datas.forEach((data) => {
        if (data.length <= 4 || data[0] !== 255 || data[1] !== 12) {
            return;
        }
        const readData = data.subarray(2, data.length);
        let value;

        if (readData.length != 8) {
            return;
        }

        switch (readData[0]) {
            case this.sensorValueSize.FLOAT: {
                value = new Buffer.from(readData.subarray(2, 6)).readFloatLE();
                value = Math.round(value * 100) / 100;
                break;
            }
            case this.sensorValueSize.SHORT: {
                value = new Buffer.from(readData.subarray(2, 4)).readInt16LE();
                break;
            }
            default: {
                value = 0;
                break;
            }
        }

        
        let checkSum = 0;
        checkSum += readData[0];
        checkSum += readData[1];
        checkSum += parseInt(value, 10);
        checkSum += readData[readData.length - 2];
        checkSum = checkSum & 255;

        if (readData[readData.length - 1] != checkSum) {
            return;
        }

        const type = readData[readData.length - 2];
        const port = readData[1];

        switch (type) {
            case this.sensorTypes.DIGITAL: {
                switch (port) {
                    case 5: {
                        sensorData.left_infared = value;
                        break;
                    }
                    case 6: {
                        sensorData.right_infared = value;
                        break;
                    }
                    case 11: {
                        sensorData.motion = value;
                        break;
                    }
                    default: {
                        break;
                    }
                }
                break;
            }
            case this.sensorTypes.ANALOG: {
                switch (port) {
                    case 0: {
                        sensorData.gas = value;
                        break;
                    }
                    case 1: {
                        sensorData.cds = value;
                        break;
                    }
                    case 2: {
                        sensorData.tmp = (value * 5.0 / 1024.0 / 0.01).toFixed(2);
                        break;
                    }
                    case 3: {
                        sensorData.vibe = value;
                        break;
                    }
                    default: {
                        break;
                    }
                }
                break;
            }
            case this.sensorTypes.ULTRASONIC: {
                switch (port) {
                    case 13: {
                        sensorData.ultrasonic = value;
                        break;
                    }
                    default: {
                        break;
                    }
                }
                break;
            }
            default: {
                break;
            }
        }
    });
    this.sensor_data = sensorData;
};

Module.prototype.getDataByBuffer = function(buffer) {
    const datas = [];
    let lastIndex = 0;
    buffer.forEach((value, idx) => {
        if (value == 13 && buffer[idx + 1] == 10) {
            datas.push(buffer.subarray(lastIndex, idx));
            lastIndex = idx + 2;
        }
    });
    return datas;
};

Module.prototype.disconnect = function(connect) {
    connect.close();
    if (this.sp) {
        delete this.sp;
    }
};

Module.prototype.reset = function() {
    this.lastTime = 0;
    this.lastSendTime = 0;
};

module.exports = new Module();
