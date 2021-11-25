import fs from 'fs';
import dotenv from 'dotenv';

import cfg from '../config.js';

dotenv.config({ path: new URL('./.env', import.meta.url) });

const testTarget = 'nt'; // 'nt' for nano-things, 'lh' for localhost
const nsName = 'chirpstack'; // NS Specific !!!

const bodyExampleText = fs.readFileSync(
  new URL(`./uplink_data_sample_from_${nsName}.json`, import.meta.url),
);

const bodyDev1 = JSON.parse(bodyExampleText);
bodyDev1.devEUI = Buffer.from(process.env.DEV_EUI, 'hex').toString('base64'); // NS Specific !!! "devEUI" field

const bodyMobileApp = JSON.parse(bodyExampleText);
bodyMobileApp.devEUI = Buffer.from(process.env.DEV_EUI_MOBILE_APP, 'hex').toString('base64'); // NS Specific !!! "devEUI" field

const bodyRnd = JSON.parse(bodyExampleText);
bodyRnd.devEUI = Buffer.from(process.env.DEV_EUI_RND, 'hex').toString('base64'); // NS Specific !!! "devEUI" field

const headersDev1AccessToken = {
  'x-access-token': process.env.ACCESS_TOKEN,
  'x-realm': 'dev1',

  'x-downlink-api': process.env.DL_WEBHOOK, // NS Specific !!! Only needed for Everynet and Chirpstack
  'x-downlink-apikey': 'myDownlinkApiKey', // NS Specific !!! Only needed for Everynet and Chirpstack

  'content-type': 'application/json',
};

const headersDev1Credentials = {
  'x-client-id': process.env.DEV1_CLIENT_ID,
  'x-client-secret': process.env.DEV1_CLIENT_SECRET,
  'x-realm': 'dev1',

  'x-downlink-api': process.env.DL_WEBHOOK, // NS Specific !!! Only needed for Everynet and Chirpstack
  'x-downlink-apikey': 'myDownlinkApiKey', // NS Specific !!! Only needed for Everynet and Chirpstack

  'content-type': 'application/json',
};

const headersKeycloakCredentials = {
  'x-client-id': process.env.LELAB_CLIENT_ID,
  'x-client-secret': process.env.LELAB_CLIENT_SECRET,
  'x-realm': 'le-lab',

  'x-downlink-api': process.env.DL_WEBHOOK, // NS Specific !!! Only needed for Everynet and Chirpstack
  'x-downlink-apikey': 'myDownlinkApiKey', // NS Specific !!! Only needed for Everynet and Chirpstack

  'content-type': 'application/json',
};

const headersRndCredentials = {
  'x-client-id': process.env.DEV1_CLIENT_ID,
  'x-client-secret': process.env.DEV1_CLIENT_SECRET,
  'x-realm': 'rnd',

  'x-downlink-api': process.env.DL_WEBHOOK, // NS Specific !!! Only needed for Everynet and Chirpstack
  'x-downlink-apikey': 'myDownlinkApiKey', // NS Specific !!! Only needed for Everynet and Chirpstack

  'content-type': 'application/json',
};

const method = 'POST';

const dlBodyDev1 = {
  type: 'downlink',
  deveui: process.env.DEV_EUI,
  port: '2',
  payload: '020402',
};

const dlBodyMobileApp = {
  type: 'downlink',
  deveui: process.env.DEV_EUI_MOBILE_APP,
  port: '2',
  payload: '020402',
};

const dlBodyRnd = {
  type: 'downlink',
  deveui: process.env.DEV_EUI_RND,
  port: '2',
  payload: '020402',
};

const dlHeaders = {
  'content-type': 'application/json',
};

const urls = {
  lh: {
    ul: `http://localhost:${cfg.NIT_SERVER_PORT}/uplink_from_${nsName}/${process.env.NITAPIKEY}`,
    dl: `http://localhost:${cfg.NIT_SERVER_PORT}/downlink_to_${nsName}/${process.env.NITAPIKEY}`,
  },
  nt: {
    ul: `https://nano-things.net/tpxle-nit/uplink_from_${nsName}/${process.env.NITAPIKEY}`,
    dl: `https://nano-things.net/tpxle-nit/downlink_to_${nsName}/${process.env.NITAPIKEY}`,
  },
};

const examples = [
  // Dev1 - Access Token
  {
    url: urls[testTarget].ul,
    options: { method, headers: headersDev1AccessToken, body: JSON.stringify(bodyDev1) },
  },
  {
    url: urls[testTarget].dl,
    options: { method, headers: dlHeaders, body: JSON.stringify(dlBodyDev1) },
  },

  // Dev1 - Credentials
  {
    url: urls[testTarget].ul,
    options: { method, headers: headersDev1Credentials, body: JSON.stringify(bodyDev1) },
  },
  {
    url: urls[testTarget].dl,
    options: { method, headers: dlHeaders, body: JSON.stringify(dlBodyDev1) },
  },

  // Mobile App
  {
    url: urls[testTarget].ul,
    options: { method, headers: headersKeycloakCredentials, body: JSON.stringify(bodyMobileApp) },
  },
  {
    url: urls[testTarget].dl,
    options: { method, headers: dlHeaders, body: JSON.stringify(dlBodyMobileApp) },
  },

  // RnD
  {
    url: urls[testTarget].ul,
    options: { method, headers: headersRndCredentials, body: JSON.stringify(bodyRnd) },
  },
  {
    url: urls[testTarget].dl,
    options: { method, headers: dlHeaders, body: JSON.stringify(dlBodyRnd) },
  },
];

export default examples;
