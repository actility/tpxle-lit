import dotenv from 'dotenv';
import mqtt from 'mqtt';

dotenv.config({ path: new URL('./.env', import.meta.url) });

const url = process.env.BROKER_URL;
const options = {
  clean: true,
  connectTimeout: 4000,
  // clientId: 'emqx_test',
  // username: process.env.DEV1_CLIENT_ID,
  // password: process.env.DEV1_CLIENT_SECRET,
  username: process.env.LELAB_CLIENT_ID,
  password: process.env.LELAB_CLIENT_SECRET,
  rejectUnauthorized: false,
  ca: process.env.CA_CERT_LOCATION,
};

// const subscribeTopic = `${process.env.CLIENT_ID}/#`;
const subscribeTopic = `${process.env.CLIENT_ID_KEYCLOAK}/#`;

const mqttClient = mqtt.connect(url, options);
mqttClient.on('connect', () => {
  console.log('MQTT Client Connected');
  mqttClient.subscribe(subscribeTopic, (err) => {
    if (!err) {
      console.log(`You subscribed to the "${subscribeTopic}" topic.`);
    }
  });
});

mqttClient.on('message', (topic, message) => {
  console.log(topic);
  console.log(message.toString());
});
