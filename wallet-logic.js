var nanocurrency = require('nanocurrency');
var BigNumber = require('bignumber.js');
var rawconv = {from:'raw',to:'Nano'};
var nanoconv = {from:'Nano',to:'raw'};
var getUrlParameter = function getUrlParameter(sParam) {
  var sPageURL = window.location.search.substring(1),
    sURLVariables = sPageURL.split('&'),
    sParameterName,
    i;
  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split('=');
    if (sParameterName[0] === sParam) {
      return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
    }
  }
};
var rpcurl = 'http://' + getUrlParameter('node') + ':7076';

async function getseed() {
  var seed = await nanocurrency.generateSeed();
  var privatekey = nanocurrency.deriveSecretKey(seed, 0);
  var publickey = nanocurrency.derivePublicKey(privatekey);
  var address = nanocurrency.deriveAddress(publickey,{useNanoPrefix:true});
  var payload = {
    "privatekey":privatekey,
    "publickey":publickey,
    "address":address
  };
  return payload;
}
$('body').on('click', '.genwallet', async function(){
  $('#history').empty();
  $('#output').empty();
  $('#pendingblocks').empty();
  $('#dynform').empty();
  $('#qrcode').empty();
  var walletdata = await getseed();
  $('#output').append(
    'Private Key: ' + walletdata.privatekey +
    '<br>Public Key: ' + walletdata.publickey +
    '<br>Address: ' + walletdata.address
  );
  new QRCode(document.getElementById("qrcode"), walletdata.address);
});

async function rpcall(body) {
  var Init = { method:'POST',body: JSON.stringify(body)};
  var res = await fetch(rpcurl,Init);
  var data = await res.json();
  return data;
}

$('body').on('click', '.scan', function(){
  $('#qrpreview').append('<video id="preview"></video>');
  let scanner = new Instascan.Scanner({ video: document.getElementById('preview') });
  scanner.addListener('scan', function (content) {
    $('#destination').val(content);
    scanner.stop();
    $('#preview').remove();
  });
  Instascan.Camera.getCameras().then(function (cameras) {
    if (cameras.length > 0) {
      scanner.start(cameras[0]);
    } else {
      console.error('No cameras found.');
    }
  }).catch(function (e) {
    console.error(e);
  });
});

$('body').on('click', '.sendfunds', async function(){
  var senderprivate = $("#key").val();
  var amount = nanocurrency.convert($("#amount").val(),nanoconv);
  var senderpublickey = nanocurrency.derivePublicKey(senderprivate);
  var sender = nanocurrency.deriveAddress(senderpublickey,{useNanoPrefix:true});  
  var destination = $("#destination").val();
  var info = {};
  info['action'] = 'account_info';
  info['representative'] = 'true';
  info['account'] = sender;
  var res = await rpcall(info);
  console.log(res);
  console.log('Calculating pow for ' + res.frontier + ' this may take some time')
  var pow = await nanocurrency.computeWork(res.frontier);
  var balance = new BigNumber(res.balance).minus(new BigNumber(amount)).toFixed();
  var block = nanocurrency.createBlock(senderprivate, {
    work: pow,
    previous: res.frontier,
    representative: res.representative,
    balance: balance,
    link: destination
  });
  var send = {};
  send['action'] = 'process';
  send['json_block'] = 'true';
  send['subtype'] = 'send';
  send['block'] = block.block;
  var sendres = await rpcall(send);
  console.log(sendres);
  $('.openwallet').click();
});

$('body').on('click', '.openwallet', async function(){
  $('#history').empty();
  $('#output').empty();
  $('#pendingblocks').empty();
  $('#dynform').empty();
  $('#qrcode').empty();
  var rep = 'nano_18gmu6engqhgtjnppqam181o5nfhj4sdtgyhy36dan3jr9spt84rzwmktafc';
  var privatekey = $("#key").val();
  var publickey = nanocurrency.derivePublicKey(privatekey);
  var address = nanocurrency.deriveAddress(publickey,{useNanoPrefix:true});
  new QRCode(document.getElementById("qrcode"), address);
  var info = {};
  info['action'] = 'account_info';
  info['representative'] = 'true';
  info['account'] = address;
  var info = await rpcall(info);
  if ('frontier' in info){
    var frontier = info.frontier;
    var balance = nanocurrency.convert(info.balance,rawconv);
    var representative = info.representative;
    $('#dynform').append('\
      <div id="sendform">\
        <label for="amount">Amount:</label>\
        <input type="text" id="amount" name="amount"><br>\
        <label for="destination">Destination:</label>\
        <input type="text" id="destination" name="destination"><br>\
      </div>\
      <button class="scan" type="button">ScanQR</button><br>\
      <button class="sendfunds" type="button">Send</button>');
  }
  $('#output').append(
    'Address: ' + address +
    '<br>balance: ' + balance +
    '<br>Representative: ' + representative 
  );
  var history = {};
  history['action'] = 'account_history';
  history['account'] = address;
  var history = await rpcall(history);
  if (Array.isArray(history.history) && history.history.length){
    $('#history').append('\
      <table id="histable"  border="1">\
        <tr>\
	  <td>type</td>\
	  <td>account</td>\
	  <td>amount</td>\
	</tr>\
      </table>');
    $.each(history.history, function( index, value ) {
      $('#histable tr:last').after('\
        <tr>\
          <td>' + value.type + '</td>\
          <td>' + value.account + '</td>\
          <td>' + nanocurrency.convert(value.amount,rawconv) + '</td>\
	</tr>');
    });
  }
  var pending = {};
  pending['action'] = 'pending';
  pending['source'] = 'true';
  pending['sorting'] = 'true';
  pending['account'] = address;
  var pending = await rpcall(pending);
  if (typeof pending.blocks === 'object'){
    $('#pendingblocks').append('\
      <table id="pendtable"  border="1">\
        <tr>\
	  <td>block</td>\
          <td>source</td>\
          <td>amount</td>\
        </tr>\
      </table>');
    $.each(pending.blocks, function( key, value ) {
      $('#pendtable tr:last').after('\
        <tr>\
	  <td><button class="receive" value="' + key + '|' + value.amount + '|' + value.source + '">Recieve</button></td>\
          <td>' + value.source + '</td>\
          <td>' + nanocurrency.convert(value.amount,rawconv) + '</td>\
        </tr>');
    });
  }
});

$('body').on('click', '.receive', async function(){
  var data = $(this).attr("value").split('|');
  var block = data[0];
  var amount = data[1];
  var sender = data[2];
  var privatekey = $("#key").val();
  var publickey = nanocurrency.derivePublicKey(privatekey);
  var address = nanocurrency.deriveAddress(publickey,{useNanoPrefix:true});
  var info = {};
  info['action'] = 'account_info';
  info['representative'] = 'true';
  info['account'] = address;
  var info = await rpcall(info);
  if ('balance' in info){
    var startingbalance = info.balance;
    var blocktype = 'receive';
    var frontier = info.frontier;
    var previous = info.frontier;
  }
  else{
    var startingbalance = '0';
    var blocktype = 'open';
    var frontier = publickey;
    var previous = '0000000000000000000000000000000000000000000000000000000000000000';
  }
  console.log('Calculating pow for ' + frontier + ' this may take some time')
  var pow = await nanocurrency.computeWork(frontier);
  var balance = new BigNumber(startingbalance).plus(new BigNumber(amount)).toFixed();
  var block = nanocurrency.createBlock(privatekey, {
    work: pow,
    previous: previous,
    representative: 'nano_18gmu6engqhgtjnppqam181o5nfhj4sdtgyhy36dan3jr9spt84rzwmktafc',
    balance: balance,
    link: block
  });
  var receive = {};
  receive['action'] = 'process';
  receive['json_block'] = 'true';
  receive['subtype'] = blocktype;
  receive['block'] = block.block;
  console.log(receive);
  var receiveres = await rpcall(receive);
  console.log(receiveres);
  $('.openwallet').click();
});
