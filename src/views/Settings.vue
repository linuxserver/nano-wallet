<template>
  <div class="settings inner">
    <div class="block">
    <div class="details">
        <label for="representative">Current Representative</label>
        <a href="#" class="copy" @click="copyToClipboard(representative)"><i class="fad fa-clone"></i></a>
        <div class="address" style="margin-bottom: 30px; background: #00000014; padding: 4px 14px;" v-html="highlightAddress(representative)"></div>
    </div>
    <div v-if="change" class="details">
        <div v-if="error !== null" class="error">{{ error }}</div>
        <label for="newrep">Change Representative</label>
        <input class="newrep" type="text" v-model="newrep" name="newrep" />
    </div>
    <scan-qr style="margin-bottom: 20px;" v-if="change" @scanned="scanDone"></scan-qr>
    <div class="inline-buttons">
      <button v-if="!change" @click="change = true" class="repchange btn">Change Representative</button>
      <button v-if="change" @click="changeRep" class="repchange btn">Confirm</button>
      <button v-if="change" @click="change = false" class="repchange btn outline">Cancel</button>
    </div>
  </div>
  </div>
</template>

<script>
import * as NanoCurrency from 'nanocurrency'
import { serverMixin } from '../mixins/serverMixin.js'
import ScanQr from '../components/ScanQr.vue'

export default {
  name: 'Settings',
  components: {
    ScanQr
  },
  props: {
    representative: String,
    open: Boolean
  },
  mixins: [ serverMixin ],
  data() {
    return {
      newrep: '',
      change: false,
      error: null
    }
  },
  computed: {
    pow () {
      return this.$store.state.app.pow
    },
    privatekey () {
      return this.$store.state.app.privatekey
    }

  },
  watch: {
    open: function (newopen, oldopen) {
      if(newopen === false && oldopen === true) {
        this.newrep = ''
        this.change = false
        this.error = null
      }
    }
  },
  methods: {
    async changeRep () {
      if(this.pow === null) {
        this.$notify({
          title: 'PoW not complete',
          text: 'Please wait for the status to be ready',
          type: 'error'
        })
      }
      if (NanoCurrency.checkAddress(this.newrep)) {
        const publickey = NanoCurrency.derivePublicKey(this.privatekey)
        const address = NanoCurrency.deriveAddress(publickey,{useNanoPrefix:true})

        let infodetails = {};
        infodetails['action'] = 'account_info';
        infodetails['representative'] = 'true';
        infodetails['account'] = address;
        const info = await this.$store.dispatch('app/rpCall', infodetails)

        const blocktype = 'change';
        // const frontier = info.frontier;
        const previous = info.frontier;
        const balance = info.balance;
        const block = NanoCurrency.createBlock(this.privatekey, {
          work: this.pow,
          previous: previous,
          representative: this.newrep,
          balance: balance,
          link: '0000000000000000000000000000000000000000000000000000000000000000'
        });

        let repchange = {};
        repchange['action'] = 'process';
        repchange['json_block'] = 'true';
        repchange['subtype'] = blocktype;
        repchange['block'] = block.block;
        await this.$store.dispatch('app/rpCall', repchange)
        this.$emit('change', true)
      } else {
        this.error = 'Invalid Representative ' + this.newrep
      }
    },
    scanDone: function (data) {
      this.error = null
      const newrep = data.replace('nanorep:','').split('?')[0]
      if (NanoCurrency.checkAddress(newrep)) {
        this.newrep = newrep
      } else {
        this.error = 'Invalid QR Data ' + data
      }
    }
  }
}
</script>
