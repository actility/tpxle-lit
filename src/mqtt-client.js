import mqtt from 'mqtt';
import dotenv from 'dotenv';

import logger from './logger.js';
import accessTokensModel from './models/access-tokens.model.js';
import sendToTPXLEAsync from './services/send-to-tpxle.js';
import { translateUplinkAll } from './services/nit-all.service.js';

dotenv.config({ path: new URL('./.env', import.meta.url) });

const url = process.env.BROKER_URL;
const options = {
  clean: true,
  connectTimeout: 4000,
  // clientId: 'nit_mqtt_client_id',
  username: process.env.MQTT_SUPER_USER,
  password: process.env.MQTT_SUPER_PASSWD,
  rejectUnauthorized: false,
  // ca: process.env.CA_CERT_LOCATION,
};

console.log(options);

const topics = [
  `+/NS/+/NIT/${process.env.NIT_ID}/LE/+/AS`,
  `+/LE/+/NIT/${process.env.NIT_ID}/NS/+`,
];

const createMQTTClient = () => {
  const mqttClient = mqtt.connect(url, options);
  mqttClient.on('connect', () => {
    console.log('MQTT Uplink Client Connected');
    mqttClient.subscribe(topics, (err) => {
      if (!err) {
        console.log(`You subscribed to the "${JSON.stringify(topics)}" topics.`);
      }
    });
  });

  mqttClient.on('message', async (topic, message) => {
    console.log(topic);
    console.log(message.toString());

    const topicSegments = topic.split('/');
    // {subscriberId}/NS/{nsVendor}/NIT/{nitId}/LE/{leId}/AS
    // {subscriberId}/LE/{leId}/NIT/{nitId}/NS/{nsVendor}

    const [subscriberId, sendingNode, nsVendor, , , , leId] = topicSegments;

    // console.log({ subscriberId, sendingNode, nsVendor, leId });

    let translatedBody;
    let accessToken;

    switch (sendingNode) {
      case 'NS':
        try {
          translatedBody = translateUplinkAll[nsVendor](JSON.parse(message));
        } catch (err) {
          logger.error(err.stack);
          break;
          // res.status(400).send('Invalid request body. (Failed to translate request body.)\n');
        }

        try {
          accessToken = await accessTokensModel.getAccessTokenBySubscriberId(leId, subscriberId);
          await sendToTPXLEAsync(translatedBody, accessToken, leId, subscriberId);
        } catch (err) {
          logger.error(err.stack);
          break;
        }

        break;

      case 'LE':
        // TODO: Code to be written!!!
        break;

      default:
    }
  });

  return mqttClient;
};

export default createMQTTClient;
