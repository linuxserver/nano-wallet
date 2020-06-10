import * as NanoCurrency from 'nanocurrency'
import router from '@/router'

function protocol() {
  return window.location.protocol.replace(':', '')
}

function port() {
  if (protocol() == 'https'){
      return '7077'
  }
  return '7076'
}

export async function node ({ commit, state }) {
  let newnode = {...state.node}
  if(state.settings.changeaddress === true) {
    newnode.address = router.currentRoute.params.node
    newnode.port = port()
    newnode.protocol = protocol()
    if(router.currentRoute.params.node in state.settings.presets) {
      const preset = state.settings.presets[router.currentRoute.params.node]
      newnode = {
        ...newnode,
        ...preset
      }
    }
  } else {
    var i
    for (i = 0; i < state.settings.node.length; i++) {
      const controller = new AbortController();
      const timeout = setTimeout(
        () => { controller.abort() },
        10000,
      )
      const rpcurl = state.settings.node[i].protocol + '://' + state.settings.node[i].address + ':' + state.settings.node[i].port + state.settings.node[i].path
      const Init = { method:'POST',body: '{"action":"block_count"}'}
      Init.signal = controller.signal
      Init.headers = {}
      if ('headers' in state.settings.node[i]) {
        Init.headers = state.settings.node[i].headers
      }
      if ('auth' in state.settings.node[i] && state.settings.node[i].auth !== null) {
        Init.headers['Authorization'] = state.settings.node[i].auth
      }
      try {
        console.log("Checking backend: " + rpcurl)
        const res = await fetch(rpcurl,Init)
        clearTimeout(timeout)
        if (res.ok) {
          let data = await res.json()
          if (data.count) {
            console.log("Backend OK: " + rpcurl)
            newnode = {
              ...newnode,
              ...state.settings.node[i]
            }
            break
          } else {
            console.log(res)
          }
        } else {
          console.log(res)
        }
      }
      catch {
        clearTimeout(timeout)
        console.log("Timed out: " + rpcurl)
      }
    }
  }
  if('auth' in router.currentRoute.query) {
    newnode.auth = router.currentRoute.query.auth
  }
  commit('node', newnode)
  
}

export async function getSeed (context) {
  const seed = await NanoCurrency.generateSeed();
  return seedData(context, seed)
}

export async function seedData (context, seed) {
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

export async function rpCall ({commit, state}, body) {
  if (state.node.address === null) {
    await node({commit, state})
  }
  var rpcurl = state.node.protocol + '://' + state.node.address + ':' + state.node.port + state.node.path
  var Init = { method:'POST',body: JSON.stringify(body)}
  Init.headers = {}
  if ('headers' in state.node) {
    Init.headers = state.node.headers
  }
  if (state.node.auth !== null) {
    Init.headers['Authorization'] = state.node.auth
  }
  var res = await fetch(rpcurl,Init)
  var data = await res.json()
  console.log(data)
  console.log(commit)
  return data
}

let historycalls = 0
export async function history (context, address) {
  let history = {}
  history['action'] = 'account_history'
  history['account'] = address
  history['count'] = 64
  console.log('history')
  try {
    const details = await context.dispatch('rpCall', history);
    if (Array.isArray(details.history) && details.history.length){
      context.commit('history', details.history)
    }
  } catch (err) {
    console.log(err)
    console.log('Something went wrong, rate minited maybe? try again')
    if(historycalls < 3) {
      setTimeout(function(){ 
        historycalls++
        context.dispatch('history', address)
      }, 2000);
    }
  }

}

let pendingcalls = 0
export async function pending (context, address) {
  let pending = {}
  pending['action'] = 'pending'
  pending['source'] = 'true'
  pending['sorting'] = 'true'
  pending['account'] = address

  try {

    const details = await context.dispatch('rpCall', pending);
    console.log('pending1')

    if (typeof details.blocks === 'object'){
      console.log('pending')
      context.commit('pending', details.blocks)
    } else {
      context.commit('pending', [])
    }
  } catch (err) {
    console.log(err)
    console.log('Something went wrong, rate minited maybe? try again')
    if(pendingcalls < 3) {
      setTimeout(function(){ 
        pendingcalls++
        context.dispatch('pending', address)
      }, 2000);
    }
  }

}

export function resetState ({ dispatch, commit }) {
  commit('resetState')
  dispatch('node')
}
