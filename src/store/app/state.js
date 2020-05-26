export function initialState () {
  return {
    privatekey: null,
    pow: null,
    ready: false,
    history: [],
    pending: [],
    node: null
  }
}

export default function () {
  return initialState()
}
