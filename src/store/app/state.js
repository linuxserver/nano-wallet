export function initialState () {
  return {
    // SETTINGS CAN BE CHANGED
    settings: {
      pow: 1,
      changeaddress: true,
      checkbackends: true,
      followlinks: true,
      receiveinterval: 10000,
      nfctoken: process.env.VUE_APP_NFC_TOKEN,
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
        },
	'app.natrium.io': {
          port: 443,
          path: '/api',
          protocol: 'https',
          headers: {
            'Content-Type': 'application/json'
          }
        },
	'api.nanex.cc': {
          port: 443,
          path: '/',
          protocol: 'https',
          headers: {
            'Content-Type': 'application/json'
          }
        },
        'vault.nanocrawler.cc': {
          port: 443,
          path: '/api/node-api',
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
