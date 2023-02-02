// import { stringify } from 'querystring';
import fetch from 'node-fetch';
import httpError from 'http-errors';

// import cfg from '../config.js';
import logger from '../logger.js';
import AccessTokensModel from '../models/access-tokens.model.js';

import getConfParam from '../config/get-conf-params.js';

const sendToTPXLEAsync = async (translatedBody, accessToken, architectureId, clientId) => {
  const devEUI = translatedBody.deviceEUI;

  const url = getConfParam(architectureId, 'FEED_URL');

  const options = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(translatedBody),
  };

  logger.silly(`URL: ${url}`);
  logger.silly(`OPTIONS: ${JSON.stringify(options, null, 4)}`);

  try {
    const tpxleResponse = await fetch(url, options);
    const tpxleResponseText = await tpxleResponse.text();
    if (!tpxleResponse.ok) {
      logger.error(
        `UL: sendToTPXLEAsync: DevEUI: ${devEUI}:  HTTP error happened while forwarding UL to TPXLE: ${tpxleResponse.status}, ${tpxleResponse.statusText}`,
      );

      logger.error(`UL: sendToTPXLEAsync: DevEUI: ${devEUI}: Response Text: ${tpxleResponseText}`);

      if (tpxleResponse.status === 401) {
        AccessTokensModel.deleteAccessToken(architectureId, clientId);
      }

      throw httpError(500, `HTTP error happened while forwarding UL to TPXLE`);
    }
    logger.debug(
      `UL: sendToTPXLEAsync: DevEUI: ${devEUI}: Message forwarded to TPXLE (${url}). ${tpxleResponse.status}, ${tpxleResponse.statusText}, ${tpxleResponseText}`,
    );
    logger.silly(`UL: sendToTPXLEAsync: DevEUI: ${devEUI}: ${JSON.stringify(translatedBody)}`);

    return tpxleResponseText;
  } catch (err) {
    if (httpError.isHttpError(err)) {
      // console.log('KAKUKK_CATCHED');
      // console.log(url);
      // console.log(JSON.stringify(options, null, 4));

      throw err;
    } else {
      logger.error(
        `UL: DevEUI: ${devEUI}: The mesage couldn't be forwarded to TPXLE: ${err.stack}`,
      );
      throw httpError(500, `The mesage couldn't be forwarded to TPXLE.`);
    }
  }
};

export default sendToTPXLEAsync;
