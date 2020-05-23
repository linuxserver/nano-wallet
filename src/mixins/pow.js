const NanoCurrency = require('nanocurrency')
// When the parent theard requires it, render the HTML
self.addEventListener("message", async (message) => {
  console.log(message)
  console.log('Computing work for ' + message.data)
  const result = await NanoCurrency.computeWork(message.data);
  self.postMessage(result);
});

