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


function abbreviateNumber (number) {
  const SI_SYMBOL = ["", "k", "M", "G", "T", "P", "E"];
  let tier = Math.log10(number) / 3 | 0;
  if(tier == 0) return Number.parseFloat(number).toFixed(2);
  let suffix = SI_SYMBOL[tier];
  let scale = Math.pow(10, tier * 3);
  let scaled = number / scale;
  return scaled.toFixed(2) + '<span class="suffix">' + suffix + '</span>';
}

function abbreviateAddress (address) {
  return address.substring(0, 11) + '...' + address.slice(address.length - 6)
}
function highlightAddress (address) {
  const length = address.length;
  const end = address.length - 6;
  return '<span class="highlight">' + address.substring(0, 11) + '</span>' + address.substring(11, end) + '<span class="highlight">' + address.slice(address.length - 6) + '</span>'
}

function transactionStatus (value) {
  if (value === 'send') return 'Sent'
  if (value === 'receive') return 'Received'
}

async function getseed() {
  var seed = await NanoCurrency.generateSeed();
  var privatekey = NanoCurrency.deriveSecretKey(seed, 0);
  var publickey = NanoCurrency.derivePublicKey(privatekey);
  var address = NanoCurrency.deriveAddress(publickey,{useNanoPrefix:true});
  var payload = {
    "privatekey":privatekey,
    "publickey":publickey,
    "address":address
  };
  return payload;
}
$('body').on('click', '.genwallet', async function(){
  $('#genoutput').empty();
  $('#genqrcode').empty();
  var walletdata = await getseed();
  $('#genwallet').addClass('active')
  $('#genoutput').append(
    '<div class="details"><label for="privatekey">Private Key</label><div class="copy">Copy</div><input class="copytext" type="text" name="privatekey" value="' + walletdata.privatekey + '" /></div>' +
    '<div class="details"><label for="publickey">Public Key</label><div class="copy">Copy</div><input class="copytext" type="text" name="publickey" value="' + walletdata.publickey + '" /></div>' +
    '<div class="details"><label for="address">Address</label><div class="copy">Copy</div><input class="copytext" type="text" name="address" value="' + walletdata.address + '" /></div>'
  );

  new QRCode(document.getElementById("genqrcode"), walletdata.address);
});

async function rpcall(body) {
  var Init = { method:'POST',body: JSON.stringify(body)};
  var res = await fetch(rpcurl,Init);
  var data = await res.json();
  return data;
}

$('body').on('click', '.scan', function(){
  $('#scan').addClass('active')
  $('#qrpreview').append('<video id="preview"></video>');
  let scanner = new Instascan.Scanner({ video: document.getElementById('preview') });
  scanner.addListener('scan', function (content) {
    $('#destination').val(content);
    scanner.stop();
    $('#preview').remove();
    $('#scan').removeClass('active')
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
  var amount = NanoCurrency.convert($("#amount").val(),nanoconv);
  var senderpublickey = NanoCurrency.derivePublicKey(senderprivate);
  var sender = NanoCurrency.deriveAddress(senderpublickey,{useNanoPrefix:true});  
  var destination = $("#destination").val();
  var info = {};
  info['action'] = 'account_info';
  info['representative'] = 'true';
  info['account'] = sender;
  var res = await rpcall(info);
  console.log(res);
  console.log('Calculating pow for ' + res.frontier + ' this may take some time')
  var pow = await NanoCurrency.computeWork(res.frontier);
  var balance = new BigNumber(res.balance).minus(new BigNumber(amount)).toFixed();
  var block = NanoCurrency.createBlock(senderprivate, {
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
  $('#send').removeClass('active');
});

$('#output').on('click', '.copy', function() {
  const parent = $(this).parent()
  const input = parent.find('input')
  //alert(input.val())
  input.select()
  document.execCommand("copy")
  alert('Copied to clipboard')
})

$('#walletmenu').on('click', 'a', function(e) {
  e.preventDefault()
  const tab = $(this).data('tab')
  $(tab).addClass('active')
});

$('#app').on('click', '.close', function(e) {
  e.preventDefault()
  const parent = $(this).parent()
  parent.removeClass('active')
})

$('body').on('click', '.openwallet', async function(){
  $('#history').empty();
  $('#output').empty();
  $('#settingsdetails').empty();
  $('#pendingblocks').empty();
  $('#dynform').empty();
  $('#qrcode').empty();
  var rep = 'nano_18gmu6engqhgtjnppqam181o5nfhj4sdtgyhy36dan3jr9spt84rzwmktafc';
  var privatekey = $("#key").val();
  var publickey = NanoCurrency.derivePublicKey(privatekey);
  var address = NanoCurrency.deriveAddress(publickey,{useNanoPrefix:true});
  $('#qrcode').prepend('<div class="address">' + highlightAddress(address) + '</div>')
  new QRCode(document.getElementById("qrcode"), address);
  var info = {};
  info['action'] = 'account_info';
  info['representative'] = 'true';
  info['account'] = address;
  var info = await rpcall(info);
  $('#wallet').addClass('active');
  if ('frontier' in info){
    var frontier = info.frontier;
    var balance = NanoCurrency.convert(info.balance,rawconv);
    var representative = info.representative;
    $('#dynform').append('\
      <div id="sendform">\
        <label for="amount">Amount:</label>\
        <input type="text" id="amount" name="amount">\
        <label for="destination">Destination:</label>\
        <input type="text" id="destination" name="destination">\
      </div>\
      <button class="sendfunds" type="button">Send</button><button class="scan" type="button">Scan QR</button>');
  }
  $('#output').append(
    '<div class="balance"><div class="value"><img src="img/coin.svg" />' + abbreviateNumber(balance) + '</div><div class="raw"><img src="img/coin.svg" />' + balance + '</div></div>'
  );
  $('#settingsdetails').append(
    '<div class="details"><label for="representative">Representative</label><div class="copy">Copy</div><input class="copytext" type="text" name="representative" value="' + representative + '" /></div>'
  )
  var history = {};
  history['action'] = 'account_history';
  history['account'] = address;
  var history = await rpcall(history);
  if (Array.isArray(history.history) && history.history.length){
    $.each(history.history, function( index, value ) {
      let date = new Date(value.local_timestamp * 1000); 
      $('#history').append('\
      <div class="transaction ' + value.type + '">\
        <div class="type"><img class="' + value.type + '" src="img/' + (value.type === 'send' ? 'minus-' : 'plus-' ) + 'circle.svg" alt="' + value.type + '" /></div>\
        <div class="innerdetails">\
          <div class="amount"><div title="' + NanoCurrency.convert(value.amount,rawconv) + '" class="value"><img src="img/coin.svg" />' + abbreviateNumber(NanoCurrency.convert(value.amount,rawconv)) + '</div><div class="type">' + transactionStatus(value.type) + '</div></div>\
          <div class="address">' + date.getDate() + ' ' + date.toLocaleString('default', { month: 'short' }) + ' ' + date.getFullYear() + ' - ' + abbreviateAddress(value.account) + '</div>\
        </div>\
	    </div>');
    });
  }
  var pending = {};
  pending['action'] = 'pending';
  pending['source'] = 'true';
  pending['sorting'] = 'true';
  pending['account'] = address;
  var pending = await rpcall(pending);
  if (typeof pending.blocks === 'object'){
    $.each(pending.blocks, function( key, value ) {
      $('#pendingblocks').append('\
      <div class="transaction pending">\
      <div class="type"><img class="pending" src="img/exclamation-circle.svg" alt="pending" /></div>\
      <div class="innerdetails">\
        <div class="amount"><div title="' + NanoCurrency.convert(value.amount,rawconv) + '" class="value"><img src="img/coin.svg" />' + NanoCurrency.convert(value.amount,rawconv) + '</div><div class="type"><button class="pocket" value="' + key + '|' + value.amount + '|' + value.source + '">Receive</button></div></div>\
        <div class="address">' + abbreviateAddress(value.source) + '</div>\
      </div>\
      </div>');
    });
  }
});

$('body').on('click', '.pocket', async function(){
  var data = $(this).attr("value").split('|');
  var block = data[0];
  var amount = data[1];
  var sender = data[2];
  var privatekey = $("#key").val();
  var publickey = NanoCurrency.derivePublicKey(privatekey);
  var address = NanoCurrency.deriveAddress(publickey,{useNanoPrefix:true});
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
  var pow = await NanoCurrency.computeWork(frontier);
  var balance = new BigNumber(startingbalance).plus(new BigNumber(amount)).toFixed();
  var block = NanoCurrency.createBlock(privatekey, {
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
