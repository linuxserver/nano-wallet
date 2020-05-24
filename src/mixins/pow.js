const NanoCurrency = require('nanocurrency')
// When the parent theard requires it, render the HTML
self.addEventListener("message", async (message) => {
  // console.log(message)
  console.log('Computing work for ' + message.data.blockHash)
  const { blockHash, workerIndex, workerCount } = message.data;
  const result = await NanoCurrency.computeWork(blockHash, { workerIndex, workerCount });
  self.postMessage(result);
});

