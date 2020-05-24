function protocol() {
  return window.location.protocol
}

function port() {
  if (protocol == 'https:'){
      return '7077'
  }
  return '7076'
}

export async function rpCall (context, body) {
  var rpcurl = protocol() + '//' + context.state.node + ':' + port()
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
    console.log(details)
    context.commit('history', details.history)
  }
}

export async function pending (context, address) {
  const pending = {
    action: 'pending',
    source: 'true',
    sorting: 'true',
    address: address
  }

  const details = await context.dispatch('rpCall', pending);
  console.log('pending1')
  console.log(details)

  if (typeof details.blocks === 'object'){
    console.log('pending')
    context.commit('pending', details.blocks)
  }

}
