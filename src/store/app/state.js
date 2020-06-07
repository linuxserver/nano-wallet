export function initialState () {
  return {
    // SETTINGS CAN BE CHANGED
    settings: {
      pow: 1,
      changeaddress: true,
      node: [
        {
          address: 'nano.linuxserver.io',
          protocol: 'http',
          port: 7076,
          path: '',
        },
	{
          address: 'nano2.linuxserver.io',
          protocol: 'http',
          port: 7076,
          path: '',
        }
      ],
      presets: {
        'mynano.ninja': {
          port: 443,
          path: '/api/node',
          protocol: 'https',
          headers: {
            'Content-Type': 'application/json'
          }
        },
        'proxy.nanos.cc': {
          port: 443,
          path: '/proxy',
          protocol: 'https',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      }
    },
    // DO NOT CHANGE ANYTHING BELOW
    privatekey: null,
    pow: null,
    ready: false,
    history: [],
    pending: [],
    node: {
      address: null,
      port: null,
      path: '',
      auth: null
    }
  }
}

export default function () {
  return initialState()
}
