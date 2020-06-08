var numbro = require('numbro')

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
        return numbro(number).format({
          trimMantissa: true,
          mantissa: 2,
          average: true
      })
      }
      return numbro(number).format({
        trimMantissa: true,
        mantissa: 10,
        average: true
    })

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
      if (type == 'address') {
	window.open(baseurl + '/#' + this.$store.getters['app/nodeLink'] + 'address/' + data);
      }
      if (type == 'block') {
        window.open(baseurl + '/#' + this.$store.getters['app/nodeLink'] + 'block/' + data);
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
    
    abbreviateAddress (address, formatting = true) {
      let output = ''
      if (formatting === true) output += '<span class="abbreviate">'
      output += address.substring(0, 11) + '...' + address.slice(address.length - 6)
      if (formatting === true) output += '</span>'
      return output
    },

    highlightAddress (address) {
      if (address !== null && address !== undefined) {
        const end = address.length - 6;
        return '<span class="abbreviate"><span class="highlight">' + address.substring(0, 11) + '</span>' + address.substring(11, end) + '<span class="highlight">' + address.slice(address.length - 6) + '</span></span>'
      }
      return null
    },
    
    transactionStatus (value) {
      if (value === 'send') return 'Sent'
      if (value === 'receive') return 'Received'
    }
    
  }
}
