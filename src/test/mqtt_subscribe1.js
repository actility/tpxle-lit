import mqtt from 'mqtt';

import '../config.js';
import './test_config.js';

// const topics = ['dev-ope|100023878/LE_NS/actility'];
const topics = ['actility-tpe-ope|100023878/#'];

const line = '-------------------------------------------------------------------------------';

const url = 'mqtts://mqtt.preview.thingpark.com:8883';
const options = {
  clean: true,
  connectTimeout: 4000,

  username: process.env.NIT__MQTT_SUPER_USER,
  password: process.env.NIT__MQTT_SUPER_PASSWD,
  // username: 'norbert',
  // password: 'Y29tbXVuaXR5LWFwaS8xMDAwMjM4Nzg=.YWUyNDlmNTMtMzA4OC00ZTlkLWI3MjYtZDI0ZGQ4OTgxYmIx',

  rejectUnauthorized: false,
};

const mqttClient = mqtt.connect(url, options);

mqttClient.on('connect', () => {
  console.log(`\n\nMQTT Uplink Client Connected to ${url}`);

  mqttClient.subscribe(topics, (err) => {
    if (!err) {
      console.log(`You subscribed to the following topics:\n${JSON.stringify(topics, null, 2)}\n`);
    }
  });
});

mqttClient.on('message', async (topic, message) => {
  console.log(`${line}\nMSG RECEIVED AT TOPIC: "${topic}"\n${line}\n${message.toString()}`);
});
