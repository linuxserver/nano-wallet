var numeral = require('numeral')

export const serverMixin = {
  data() {
    return {
      rawconv: {from:'raw',to:'Nano'},
      nanoconv: {from:'Nano',to:'raw'}
    }
  },

  computed: {
  },
  mounted() {
  },

  methods: {
       
    abbreviateNumber (number, precision = 2) {
      if (precision === 2) {
        return numeral(number).format('0.0[000]a')
      }
      return numeral(number).format('0.0[0000000000000000000]a')

      //return scaled.toFixed(precision) + '<span class="suffix">' + suffix + '</span>';
    },
    
    copyToClipboard(text) {

      let input = document.createElement('textarea');
      input.innerHTML = text;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      alert('Copied to clipboard')

    },
    
    link(type,data) {
      const baseurl = window.location.origin;
      const server = this.$route.params.node;
      if (type == 'address'){
	window.open(baseurl + '/#/' + server + '/address/' + data);
      }
      if (type == 'block'){
        window.open(baseurl + '/#/' + server + '/block/' + data);
      }
    },

    /*async keyFromClipboard() {
      try {
        const text = await navigator.clipboard.readText()
        this.key = text
      } catch(e) {
        alert('This bowser does not support pasting from clipboard')
      }
    },*/
    
    abbreviateAddress (address) {
      return address.substring(0, 11) + '...' + address.slice(address.length - 6)
    },

    highlightAddress (address) {
      if (address !== null && address !== undefined) {
        const end = address.length - 6;
        return '<span class="highlight">' + address.substring(0, 11) + '</span>' + address.substring(11, end) + '<span class="highlight">' + address.slice(address.length - 6) + '</span>'
      }
      return null
    },
    
    transactionStatus (value) {
      if (value === 'send') return 'Sent'
      if (value === 'receive') return 'Received'
    }
    
  }
}
