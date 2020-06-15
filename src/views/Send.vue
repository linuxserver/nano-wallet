<template>
  <div class="send">
    <div id="sendform">
        <label for="amount">Amount:</label>
          <div class="login">
            <input type="text" v-model="amount" id="amount" name="amount">
            <span  @click="setmax" class="max">MAX</span>
          </div>

        <label for="destination">Destination:</label>
        <input type="text" v-model="destination" id="destination" name="destination">
      </div>
      <scan-qr @scanned="scanDone"></scan-qr>
      <scan-nfc v-if="nfcsup !== false" @scanned="scanDone"></scan-nfc>
      <button class="sendfunds btn" @click="send" type="button">Send</button>
  </div>
</template>

<script>
import { serverMixin } from '../mixins/serverMixin.js'
import * as NanoCurrency from 'nanocurrency'
import BigNumber from 'bignumber.js'
import ScanQr from '../components/ScanQr.vue'
import ScanNfc from '../components/ScanNfc.vue'

export default {
  name: 'Send',
  mixins: [ serverMixin ],
  components: {
    ScanQr,
    ScanNfc
  },
  props: {
    address: String,
    open: Boolean
  },
  data() {
    return {
      amount: '',
      destination: '',
      nfcsup: false
    }
  },
  computed: {
    pow () {
      return this.$store.state.app.pow
    },
    ready () {
      return this.$store.state.app.ready
    },
    privatekey () {
      return this.$store.state.app.privatekey
    }
  },
  watch: {
    open: function (newopen, oldopen) {
      if(newopen === true && oldopen === false) {
        this.amount = ''
        this.destination = ''
      }
    }
  },
  mounted () {
    if ("NDEFReader" in window) {
      this.nfcsup = true
    }
  },
  methods: {
    scanDone: function (data) {
      this.amount = ''
      this.destination = ''
      const qrdata = data.replace('nano:','').split('?')
      this.destination = qrdata[0]
      if (qrdata[1]) {
        qrdata[1].split('&').forEach(function(part) {
          const item = part.split('=')
          if (item[0] == 'amount' && item[1]) {
            let nanoamount = NanoCurrency.convert(item[1],this.rawconv)
            // make sure it's a valid number
            if (this.checkamount(item[1])) {
              this.amount = nanoamount
            }
          }
        }, this)
      }
    },
    async send() {
      if(this.pow === null) {
        this.$notify({
          title: 'PoW not complete',
          text: 'Please wait for the status to be ready',
          type: 'error'
        })
      }
      if (this.amount.startsWith('.')){
        this.amount = '0' + this.amount
      }
      const amount = NanoCurrency.convert(this.amount, this.nanoconv)
      // make sure it's a valid number
      if (this.checkamount(amount) && NanoCurrency.checkAddress(this.destination)) {
        const senderpublickey = NanoCurrency.derivePublicKey(this.privatekey)
        const sender = NanoCurrency.deriveAddress(senderpublickey,{useNanoPrefix:true})
        let info = {}
        info['action'] = 'account_info'
        info['representative'] = 'true'
        info['account'] = sender
        const res = await this.$store.dispatch('app/rpCall', info)
        const balance = new BigNumber(res.balance).minus(new BigNumber(amount)).toFixed()
        const block = NanoCurrency.createBlock(this.privatekey, {
          work: this.pow,
          previous: res.frontier,
          representative: res.representative,
          balance: balance,
          link: this.destination
        })
        console.log(block)
        let send = {}
        send['action'] = 'process'
        send['json_block'] = 'true'
        send['subtype'] = 'send'
        send['block'] = block.block
        await this.$store.dispatch('app/rpCall', send)
        this.$store.commit('app/pow', null)
        this.amount = ''
        this.destination = ''
        this.$emit('close', 'true')
      } else if (!NanoCurrency.checkAddress(this.destination)) {
        this.$notify({
          title: 'Destination address is not valid',
          text: 'Please use a valid address',
          type: 'error'
        })
      }
    },
    setmax () {
      this.amount = this.$store.state.app.balance
    }
  }

}
</script>
<!--<style lang="scss" scoped>
#canvas {
  -webkit-transform: scaleX(-1);
  transform: scaleX(-1);
}
</style>-->
