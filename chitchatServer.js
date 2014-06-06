var tessel = require('tessel');
var bleLib = require('ble-ble113a');
var clone = require('structured-clone');

var ble;

var trans0_uuid = "883f1e6b76f64da187eb6bdbdb617888";
var trans0_handle = 21;

ble = bleLib.use(tessel.port['A']);

ble.on('ready', function(){

  ble.on('remoteWrite', parseData);

  ble.on('error', function(err){
    console.log(err);
  });

  ble.on('disconnect', function(peripheral, reason){
    console.log('Disconnected');
    ble.startAdvertising();
  });

  ble.on('connect', function(peripheral){
    console.log('Connected');
  });

  ble.on('startAdvertising', function(){
    console.log('Advertising.');
  });

  tessel.button.on('press', function(time){
    console.log('button pressed!');
    ble.disconnect({connection : 0});
  });

  ble.setAdvertisingData([0x02, 0x01, 0x06, 0x07, 0x08, 0x54, 0x65, 0x73, 0x73, 0x65, 0x6c], function(){
    ble.startAdvertising();
  });

});

function writeData(data){
  var ser = clone.serialize(data);
  ble.writeLocalValue(0, ser, function(err){
    if (err){
      console.log('Local write failed', err);
    }
  });
}

function parseData(connection, index, serialized_value){
  var data = clone.deserialize(serialized_value);
  console.log(data);
  writeData({data : 'Pong'});
}
