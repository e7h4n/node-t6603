const T6603 = require('./t6603');
const CO2_PPM = 0x03;

let t6603 = new T6603('/dev/ttyUSB0');

t6603.status().then(ret => console.log(ret));
