import express from 'express';

// import logger from '../logger.js';

import { tpxleAuth } from '../middlewares/tpxle-auth.middleware.js';

import { uplinkFromHelium, downlinkToHelium } from '../controllers/helium.controller.js';
import { uplinkFromTTN, downlinkToTTN } from '../controllers/ttn.controller.js';
import {
  uplinkFromChirpstack,
  downlinkToChirpstack,
} from '../controllers/chirpstack.controller.js';
import { uplinkFromEverynet, downlinkToEverynet } from '../controllers/everynet.controller.js';
import { uplinkFromSenet, downlinkToSenet } from '../controllers/senet.controller.js';

import downlinkMQTT from '../controllers/mqtt.controller.js';

const createRouter = (mqttClient) => {
  const router = express.Router();

  router.use('/uplink_from_*', tpxleAuth);

  // for legacy users that dont use nit key

  router.post('/uplink_from_helium', uplinkFromHelium);
  router.post('/downlink_to_helium', downlinkToHelium);

  router.post('/uplink_from_ttn', uplinkFromTTN);
  router.post('/downlink_to_ttn', downlinkToTTN);

  // downlink secured by nitapikey

  router.post('/uplink_from_helium/:nitapikey', uplinkFromHelium);
  router.post('/downlink_to_helium/:nitapikey', downlinkToHelium);

  router.post('/uplink_from_ttn/:nitapikey', uplinkFromTTN);
  router.post('/downlink_to_ttn/:nitapikey', downlinkToTTN);

  router.post('/uplink_from_chirpstack/:nitapikey', uplinkFromChirpstack);
  router.post('/downlink_to_chirpstack/:nitapikey', downlinkToChirpstack);

  router.post('/uplink_from_everynet/:nitapikey', uplinkFromEverynet);
  router.post('/downlink_to_everynet/:nitapikey', downlinkToEverynet);

  router.post('/uplink_from_senet/:nitapikey', uplinkFromSenet);
  router.post('/downlink_to_senet/:nitapikey', downlinkToSenet);

  router.post('/downlink_mqtt/:subscriberId/:leId/:nsVendor', downlinkMQTT(mqttClient));

  return router;
};

export default createRouter;
