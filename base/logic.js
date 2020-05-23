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
var protocol = window.location.protocol;
var urladdress = getUrlParameter('address');
var urlblock = getUrlParameter('block');
if (protocol == 'https:'){
  var port = '7077';
}
else {
  var port = '7076';
}
var rpcurl = protocol + '//' + getUrlParameter('node') + ':' + port;

function abbreviateNumber (number, precision = 2) {
  const SI_SYMBOL = ["", "k", "M", "G", "T", "P", "E"];
  let tier = Math.log10(number) / 3 | 0;
  if(tier == 0) return Number.parseFloat(number).toFixed(precision);
  let suffix = SI_SYMBOL[tier];
  let scale = Math.pow(10, tier * 3);
  let scaled = number / scale;
  return scaled.toFixed(precision) + '<span class="suffix">' + suffix + '</span>';
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
    '<div class="details"><label for="privatekey">Private Key</label><a href="#" class="copy"><i class="fad fa-clone"></i></a><input class="copytext" type="text" name="privatekey" value="' + walletdata.privatekey + '" /></div>' +
    '<div class="details"><label for="publickey">Public Key</label><a href="#" class="copy"><i class="fad fa-clone"></i></a><input class="copytext" type="text" name="publickey" value="' + walletdata.publickey + '" /></div>' +
    '<div class="details"><label for="address">Address</label><a href="#" class="copy"><i class="fad fa-clone"></i></a><input class="copytext" type="text" name="address" value="' + walletdata.address + '" /></div>'
  );

  new QRCode(document.getElementById("genqrcode"), walletdata.address);
});

function resetHeight(){
  // reset the body height to that of the inner browser
  document.body.style.height = window.innerHeight + "px";
  // $('#app').css('height', window.innerHeight + "px");
}
// reset the height whenever the window's resized
window.addEventListener("resize", resetHeight);
// called to initially set the height.
resetHeight();

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
  var pow = $('#workstorage').data('workstorage').data;
  if (!pow){
    alert('Calculation not yet complete, please try again when the status has changed to ready');
    console.log('work not ready');
    return null;
  }
  console.log(pow);
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

$('#app').on('click', '.copy', function(e) {
  e.preventDefault()
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
}).on('click', '#closewallet', function(e) {
  $('#wallet').removeClass('active')
}).on('click', '.status.ready', function(e) {
  alert($('#workstorage').data('workstorage').data)
});

$('#app').on('keyup', '#key', function(e){
  if(e.keyCode == 13)
  {
    $('.openwallet').click();
  }
});

async function genwork(hash){
  if (window.Worker) {
    console.log('Calculating pow for ' + hash + ' this may take some time');
    const hardwareConcurrency = window.navigator.hardwareConcurrency || 2;
    const workerCount = Math.max(hardwareConcurrency - 1, 1);
    const work = () => new Promise(resolve => {
      const workerList = [];
      for (let i = 0; i < workerCount; i++) {
        const worker = new Worker('pow.js');
        worker.postMessage({
          blockHash: hash,
          workerIndex: i,
          workerCount: workerCount
        });
        worker.onmessage = (work) => {
          console.log('Work Generated');
          $('#workstorage').data('workstorage',work);
          $('#powstatus .busy').removeClass('active');
          $('#powstatus .ready').addClass('active');
          for (let workerIndex in workerList) {
            workerList[workerIndex].terminate();
          }
          resolve();
        };
        workerList.push(worker);
      }
    });
    await work();
  }
  else{
    console.log('Calculating pow for ' + hash + ' this may take some time');
    var pow = await NanoCurrency.computeWork(hash);
    $('#workstorage').data('workstorage',work);
  }
}
$('body').on('click', '.openwallet', async function(){
  $('#history').empty();
  $('#output').empty();
  $('#settingsdetails').empty();
  $('#pendingblocks').empty();
  $('#dynform').empty();
  $('#qrcode').empty();
  $('#powstatus .busy').addClass('active');
  $('#powstatus .ready').removeClass('active');
  $('#workstorage').data('workstorage','');
  $('#walletmenu').show();
  $('#powstatus').show();
  $('#closewallet').show();
  if (urladdress){
    var address = urladdress;
    $('#walletmenu').hide();
    $('#powstatus').hide();
    $('#closewallet').hide();
  }
  else{
    var privatekey = $("#key").val();
    var publickey = NanoCurrency.derivePublicKey(privatekey);
    var address = NanoCurrency.deriveAddress(publickey,{useNanoPrefix:true});
  }
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
    if (!urladdress){
      genwork(frontier);  
    }
    var balance = NanoCurrency.convert(info.balance,rawconv);
    var representative = info.representative;
    $('#dynform').append('\
      <div id="sendform">\
        <label for="amount">Amount:</label>\
        <input type="text" id="amount" name="amount">\
        <label for="destination">Destination:</label>\
        <input type="text" id="destination" name="destination">\
      </div>\
      <button class="sendfunds btn" type="button">Send</button><button class="scan btn outline" type="button">Scan QR</button>');
  }
  else{
    if (!urladdress){
      genwork(publickey);
    }
  }
  $('#output').append(
    '<div class="balance"><div class="value">' + abbreviateNumber(balance) + '</div><div class="raw">' + balance + '</div></div>'
  );
  $('#settingsdetails').append(
    '<div class="details"><label for="representative">Current Representative</label><a href="#" class="copy"><i class="fad fa-clone"></i></a></a><input class="copytext" type="text" name="representative" value="' + representative + '" /></div>\
    <div class="details"><label for="newrep">Change Representative</label><a href="#" class="copy"><i class="fad fa-clone"></i></a><input class="newrep" type="text" name="newrep" /></div>\
    <button class="repchange btn">Change Representative</button>'
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
        <div class="type icon" value="' + value.hash + '"><i class="' + value.type + ' fal ' + (value.type === 'send' ? 'fa-minus-circle' : 'fa-plus-circle' ) + '"></i></div>\
        <div class="innerdetails">\
          <div class="amount"><div title="' + NanoCurrency.convert(value.amount,rawconv) + '" class="value">' + (value.type === 'send' ? '-' : '+' ) + ' ' + abbreviateNumber(NanoCurrency.convert(value.amount,rawconv), 5) + ' <i class="fal fa-coin"></i></div><div class="type">' + transactionStatus(value.type) + '</div></div>\
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
      if (!urladdress){
        var pocketbutton = '<button class="pocket" value="' + key + '|' + value.amount + '|' + value.source + '">Receive</button>';
      }
      else{
        var pocketbutton = 'Pending';
      }
      $('#pendingblocks').append('\
      <div class="transaction pending">\
        <div class="type icon" value="' + value.hash + '"><i class="fal fa-exclamation-circle"></i></div>\
        <div class="innerdetails">\
          <div class="amount"><div title="' + NanoCurrency.convert(value.amount,rawconv) + '" class="value">+ ' + abbreviateNumber(NanoCurrency.convert(value.amount,rawconv), 5) + ' <i class="fal fa-coin"></i></div><div class="type">' + pocketbutton + '</div></div>\
          <div class="address">' + abbreviateAddress(value.source) + '</div>\
        </div>\
      </div>');
    });
  }
});

$('body').on('click', '.pocket', async function(){
  var pow = $('#workstorage').data('workstorage').data;
  if (!pow){
    alert('Calculation not yet complete, please try again when the status has changed to ready');
    console.log('work not ready');
    return null;
  }
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
    var rep = info.representative;
  }
  else{
    var startingbalance = '0';
    var blocktype = 'open';
    var frontier = publickey;
    var previous = '0000000000000000000000000000000000000000000000000000000000000000';
    var rep = address;
  }
  var balance = new BigNumber(startingbalance).plus(new BigNumber(amount)).toFixed();
  var block = NanoCurrency.createBlock(privatekey, {
    work: pow,
    previous: previous,
    representative: rep,
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

$('body').on('click', '.repchange', async function(){
  var pow = $('#workstorage').data('workstorage').data;
  if (!pow){
    alert('Calculation not yet complete, please try again when the status has changed to ready');
    console.log('work not ready');
    return null;
  }
  var privatekey = $("#key").val();
  var publickey = NanoCurrency.derivePublicKey(privatekey);
  var address = NanoCurrency.deriveAddress(publickey,{useNanoPrefix:true});
  var rep = $('.newrep').val();
  console.log(rep);
  var info = {};
  info['action'] = 'account_info';
  info['representative'] = 'true';
  info['account'] = address;
  var info = await rpcall(info);
  var blocktype = 'change';
  var frontier = info.frontier;
  var previous = info.frontier;
  var balance = info.balance;
  var block = NanoCurrency.createBlock(privatekey, {
    work: pow,
    previous: previous,
    representative: rep,
    balance: balance,
    link: '0000000000000000000000000000000000000000000000000000000000000000'
  });
  var repchange = {};
  repchange['action'] = 'process';
  repchange['json_block'] = 'true';
  repchange['subtype'] = blocktype;
  repchange['block'] = block.block;
  console.log(repchange);
  var repchangeres = await rpcall(repchange);
  console.log(repchangeres);
  $('.openwallet').click();
});

$('body').on('click', '.type', async function(){
  var blockinfo = {};
  blockinfo['action'] = 'block_info';
  blockinfo['json_block'] = 'true';
  blockinfo['hash'] = $(this).attr("value");
  var blockinfo = await rpcall(blockinfo);
  $('#breakdown .value').empty()
  let date = new Date(blockinfo.local_timestamp * 1000);
  $('#breakdown .stateblock').text(blockinfo.hash)
  $('#breakdown .subtype').text(blockinfo.subtype)
  $('#breakdown .account').text(blockinfo.block_account)
  $('#breakdown .amount').text(blockinfo.amount)
  $('#breakdown .balance').text(blockinfo.balance)
  $('#breakdown .representative').text(blockinfo.contents.representative)
  $('#breakdown .recipient').text(blockinfo.contents.link_as_account)
  $('#breakdown .date').text(blockinfo.local_timestamp)
  $('#breakdown .previous').text(blockinfo.contents.previous)
  $('#breakdown .link').text(blockinfo.contents.link)
  $('#breakdown .proof').text(blockinfo.contents.work)
  $('#breakdown .signature').text(blockinfo.contents.signature)
  $('#breakdown .json').text(JSON.stringify(blockinfo, null, '\t'))

  $('#blockdetails').addClass('active')

  console.log(blockinfo);
});

$(document).ready ( function(){
  if (urladdress){
    $('.openwallet').click();
  }
  if (urlblock){
    $( "body" ).append('<div class="type" style="display:none;" value="' + urlblock + '">');
    $('.type').click();
  }
});
