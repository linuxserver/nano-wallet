
import * as NanoCurrency from 'nanocurrency'


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
    async getSeed() {
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
    },
       
    abbreviateNumber (number, precision = 2) {
      const SI_SYMBOL = ["", "k", "M", "G", "T", "P", "E"];
      let tier = Math.log10(number) / 3 | 0;
      if(tier == 0) return Number.parseFloat(number).toFixed(precision);
      let suffix = SI_SYMBOL[tier];
      let scale = Math.pow(10, tier * 3);
      let scaled = number / scale;
      return scaled.toFixed(precision) + '<span class="suffix">' + suffix + '</span>';
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
