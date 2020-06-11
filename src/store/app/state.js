export function initialState () {
  return {
    // SETTINGS CAN BE CHANGED
    settings: {
      pow: 1,
      changeaddress: true,
      receiverefresh: false,
      nfctoken: 'Ahj98+v1x4Bc5M82YLnZNFjOSgGSGis9VHSc++KhrQHrbZMeiJ3Q7+NqXYVaadKFqk0KerB3NwPLNQhVjPo5uw8AAABheyJvcmlnaW4iOiJodHRwczovL2xpbnV4c2VydmVyLmlvOjQ0MyIsImZlYXR1cmUiOiJXZWJORkMiLCJleHBpcnkiOjE1OTU0NTE1ODYsImlzU3ViZG9tYWluIjp0cnVlfQ==',
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
