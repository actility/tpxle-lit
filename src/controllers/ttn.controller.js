import fetch from 'node-fetch';

import logger from '../logger.js';
import DownlinkDataModel from '../models/downlink-data.model.js';
import { translateUplink, translateDownlink } from '../services/nit-ttn.service.js';
import sendToTPXLEAsync from '../services/send-to-tpxle.js';

export const uplinkFromTTNAsync = async (req) => {
  const devEUI = req.body.end_device_ids.dev_eui;
  const downlinkPush = req.headers['x-downlink-push'];
  const downlinkReplace = req.headers['x-downlink-replace'];
  const downlinkApikey = req.headers['x-downlink-apikey'];

  if (!devEUI) {
    logger.warn('UL: Missing "end_device_ids.dev_eui" from request body!');
    return;
  }
  if (!downlinkPush) {
    logger.warn('UL: Missing "x-downlink-push" from request header!');
    return;
  }
  if (!downlinkReplace) {
    logger.warn('UL: Missing "x-downlink-replace" from request header!');
    return;
  }
  if (!downlinkApikey) {
    logger.warn('UL: Missing "x-downlink-apikey" from request header!');
    return;
  }

  const nitapikey = req.params.nitapikey || 'ttn'; // For backward compatibility, we allow not specifying nitapikey in the url!

  logger.debug(`UL: DevEUI: ${devEUI}: UL message received from NS.`);

  /* ** Save downlink data in db ** */
  DownlinkDataModel.setDLData(nitapikey, devEUI, {
    downlinkPush,
    downlinkReplace,
    downlinkApikey,
  });

  /* ** Translate message body ** */
  let translatedBody;
  try {
    translatedBody = translateUplink(req.body);
  } catch (err) {
    logger.error(err.stack);
    return;
  }

  /* ** Forward message to TPXLE ** */
  try {
    await sendToTPXLEAsync(
      translatedBody,
      req.middleware.tpxleToken,
      req.middleware.architectureId,
      req.middleware.clientId,
    );
  } catch (err) {
    logger.error(err.stack);
  }
};

export const downlinkToTTNAsync = async (req) => {
  /* ** Check if request body is correct ** */
  const devEUI = req.body.deveui?.toLowerCase();
  if (!devEUI) {
    logger.warn(`DL: There is no "deveui" field in request body.`);
    return;
  }

  const nitapikey = req.params.nitapikey || 'ttn'; // For backward compatibility, we allow not specifying nitapikey in the url!
  /*
  if (!nitapikey) {
    logger.warn(`DL: There is no "nitapikey" parameter in the url.`);
    res.write('There is no "nitapikey" parameter in the url.');
    res.status(400).end();
    return;
  }
  */

  logger.debug(`DL: DevEUI: ${devEUI}: DL message received from TPXLE.`);

  /* ** Translate message body ** */
  let translatedBody;
  try {
    translatedBody = translateDownlink(req.body);
  } catch (err) {
    logger.error(err.stack);
    return;
  }

  /* ** Get downlinkData from DB. ** */
  let downlinkData;
  try {
    downlinkData = await DownlinkDataModel.getDLData(nitapikey, devEUI);
  } catch (err) {
    logger.error(err.stack);
    return;
  }
  if (!downlinkData) {
    logger.warn(`DL: DevEUI: ${devEUI}: DownlinkData does not exists in the db yet.`);
    return;
  }

  /* ** Send downlink frame to NS ** */
  let nsRes;
  try {
    nsRes = await fetch(downlinkData.downlinkReplace, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${downlinkData.downlinkApikey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(translatedBody),
    });
  } catch (err) {
    logger.error(err.stack);
    return;
  }
  logger.debug(
    `DL: DevEUI: ${devEUI}: Downlink forwarded to NS. Response status: ${nsRes.status} ${nsRes.statusText}`,
  );

  let nsResText;
  try {
    nsResText = await nsRes.text();
  } catch (err) {
    logger.error(err.stack);
    return;
  }
  if (nsResText) {
    logger.debug(nsResText);
  }
};
