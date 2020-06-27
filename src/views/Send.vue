<template>
  <div class="send">
    <div class="login" v-show="checkout !== false" id="checkoutform">
      <div v-text="checkoutheader"></div>
      <div v-if="emailform !== false">
        <label for="email">Email:</label>
        <input v-bind="emailattrs" type="text" v-model="email" id="email" name="email">
      </div>
    </div>
    <div v-show="checkout !== true" id="sendform">
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
    <button class="scan btn outline" @click="renderform" type="button">Render Form</button>
    <button class="sendfunds btn" @click="send" type="button">Send</button>
  </div>
</template>

<script>
import { serverMixin } from '../mixins/serverMixin.js'
import * as NanoCurrency from 'nanocurrency'
import BigNumber from 'bignumber.js'
import ScanQr from '../components/ScanQr.vue'
import ScanNfc from '../components/ScanNfc.vue'
import yaml from 'yaml-js'

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
      nfcsup: false,
      product: '',
      checkout: false,
      checkoutheader: '',
      email: '',
      emailform: false,
      emailattrs: {}
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
    },
    async renderform() {
let formyaml = `---
product: Cool Widget
destination: nano_1zxq3qikmtuz9gum8bwyyyyn14easwepdfjw9nuke6uf8m98rtmrczbth747
price: 15.4
inputs:
  - type: email
    placeholder: user@email.com
    errormessage: Email is required
    required: true`
      const checkout = yaml.load(formyaml)
      this.checkout = true
      this.product = checkout.product
      this.amount = checkout.price
      this.destination = checkout.destination
      this.checkoutheader = 'This will send ' + checkout.price + ' Nano to ' + checkout.destination.substring(0, 11) + '...' + checkout.destination.slice(checkout.destination.length - 6) + ' for ' + checkout.product
      for (let input of checkout.inputs) {
        console.log(input)
        if (input.type == 'email') {
          this.emailform = true
          this.emailattrs = {placeholder: input.placeholder}
        }
      }
    }
  }
}
</script>
<style lang="scss" scoped>
#canvas {
  -webkit-transform: scaleX(-1);
  transform: scaleX(-1);
}
</style>
