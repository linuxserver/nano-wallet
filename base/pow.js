/* eslint-env worker */
/* global NanoCurrency:false */

importScripts('nanocurrency.umd.js');

onmessage = async function({ data }) {
  const { blockHash, workerIndex, workerCount } = data;
  const work = await NanoCurrency.computeWork(blockHash, { workerIndex, workerCount });
  postMessage(work);
};
