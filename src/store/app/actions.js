import * as NanoCurrency from 'nanocurrency'
import router from '@/router'

function protocol() {
  return window.location.protocol
}

function port() {
  if (protocol() == 'https:'){
      return '7077'
  }
  return '7076'
}

export async function getSeed () {
  const seed = await NanoCurrency.generateSeed();
  const privatekey = NanoCurrency.deriveSecretKey(seed, 0);
  const publickey = NanoCurrency.derivePublicKey(privatekey);
  const address = NanoCurrency.deriveAddress(publickey,{useNanoPrefix:true});
  const payload = {
    "seed":seed,
    "privatekey":privatekey,
    "publickey":publickey,
    "address":address
  };
  return payload;
}

export async function getDetails (context, address) {
  const info = {
    action: 'account_info',
    representative: 'true',
    account: address
  }
  const details = await rpCall(context, info)
  return details
}

export async function rpCall (context, body) {
  var rpcurl = protocol() + '//' + router.currentRoute.params.node + ':' + port()
  var Init = { method:'POST',body: JSON.stringify(body)}
  var res = await fetch(rpcurl,Init)
  var data = await res.json()
  console.log(data)
  return data
}

export async function history (context, address) {
  const history = {
    action: 'account_history',
    account: address
  }
  console.log('history')

  const details = await context.dispatch('rpCall', history);
  if (Array.isArray(details.history) && details.history.length){
    context.commit('history', details.history)
  }
}

export async function pending (context, address) {
  let pending = {}
  pending['action'] = 'pending'
  pending['source'] = 'true'
  pending['sorting'] = 'true'
  pending['account'] = address

  const details = await context.dispatch('rpCall', pending);
  console.log('pending1')

  if (typeof details.blocks === 'object'){
    console.log('pending')
    context.commit('pending', details.blocks)
  } else {
    context.commit('pending', [])
  }

}
