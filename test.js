var handler = require('./index').handler;
var data = require('./data');


handler(data, {
  succeed: console.log.bind(console),
  fail: console.error.bind(console)
})
