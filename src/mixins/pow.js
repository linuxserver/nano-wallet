const NanoCurrency = require('@thelamer/nanocurrency')
// When the parent theard requires it, render the HTML
self.addEventListener("message", async (message) => {
  // console.log(message)
  console.log('Computing work for ' + message.data.blockHash)
  const { blockHash, workerIndex, workerCount, workThreshold } = message.data;
  const result = await NanoCurrency.computeWork(blockHash, { workThreshold: workThreshold, workerIndex: workerIndex, workerCount: workerCount });
  self.postMessage(result);
});

