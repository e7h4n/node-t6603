# T6603 sensor library for node

## Install

```javascript
npm install --save t6603
```

## How to use

```javascript
const T6603 = require('./t6603');
const CO2_PPM = 0x03;

let t6603 = new T6603('/dev/ttyUSB0');

t6603.status().then(ret => console.log(ret));
t6603.read(CO2_PPM).then(ret => console.log(ret));
```

## License

ISC
