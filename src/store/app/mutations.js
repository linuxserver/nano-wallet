import initialState from './state.js'

export function pow(state, data) {
  if(data !== null) {
    console.log('Finished calculating')
    console.log(data)
  }

  state.pow = data
}
export function ready(state, data) {
  state.ready = data
}
export function privatekey(state, data) {
  state.privatekey = data
}
export function node(state, data) {
  state.node = data
}
export function history(state, data) {
  state.history = data
}
export function pending(state, data) {
  state.pending = data
}
export function balance(state, data) {
  state.balance = data
}

export function resetState(state) {
  Object.assign(state, initialState())
}
