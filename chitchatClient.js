var tessel = require('tessel');
var bleLib = require('ble-ble113a');
var clone = require('structured-clone');

var ble;

var trans0_uuid = "883f1e6b76f64da187eb6bdbdb617888";
var trans0_handle = 21;
var trans1_uuid = "21819AB0C9374188B0DBB9621E1696CD";
var trans1_handle = 25;

ble = bleLib.use(tessel.port['A']);

ble.on('ready', function(){

  ble.on('discover', function(device){
    console.log('Device found',device);
    console.log('');
    device.advertisingData.forEach(function(data){
      if (data.typeFlag == 8 && data.data == 'Tessel'){
        console.log('Found another Tessel');
        ble.stopScanning(function(err){
          ble.connect(device, function(err){
            setUpIndicate(device);
          });
        });
      }
    });
  });

  ble.on('indication', parseData);

  ble.on('error', function(err){
    console.log(err);
  });

  ble.on('disconnect', function(peripheral, reason){
    console.log('disconnected', reason);
    ble.startScanning();
  });

  ble.on('connect', function(peripheral){
    console.log('Connected to that other Tessel');
  });

  tessel.button.on('press', function(time){
    console.log('button pressed!');
    ble.disconnect({connection : 0});
  });

  ble.startScanning(function(err){
    err && console.log(err);
    console.log('Scanning');
  });

});

function setUpIndicate(peripheral){
  console.log("peripheral",peripheral);
  peripheral.discoverCharacteristics([trans0_uuid], function(err, characteristic){
    console.log("characteristic",characteristic);
    if (characteristic[0].handle == trans0_handle){
      ble.startIndications(characteristic[0], function(err){
        if (err){
          console.log("Could not start indications", err);
        }
        console.log("Indications started");
        writeData(characteristic[0], {data : "Ping!"});
      });
    } else {
      console.log("Couldn't find the appropriate characteristic. Check the configuration.");
    }
  });
}

function writeData(characteristic, data){
  var ser = clone.serialize(data);
  ble.write(characteristic, ser, function(err){
    if (err){
      console.log('Remote write failed', err);
    }
  });
}

function parseData(characteristic, serialized_value){
  var data = clone.deserialize(serialized_value);
  console.log(data);
  writeData(characteristic, {data : "Ping!"});
}
