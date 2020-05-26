<template>
  <div class="send">
    <div id="sendform">
        <label for="amount">Amount:</label>
        <input type="text" v-model="amount" id="amount" name="amount">
        <label for="destination">Destination:</label>
        <input type="text" v-model="destination" id="destination" name="destination">
      </div>
      <button class="sendfunds btn" @click="send" type="button">Send</button>
      <button class="scan btn outline" @click="scanQR" type="button">Scan QR</button>
    <div id="scan" class="page" :class="{active: scan !== false}">
        <a class="close" @click="closeScan"><i class="fal fa-times"></i></a>
        <video id="qrpreview"></video>
    </div>

  </div>
</template>

<script>
import { serverMixin } from '../mixins/serverMixin.js'
import * as NanoCurrency from 'nanocurrency'
import BigNumber from 'bignumber.js'
import Instascan from 'instascan'

export default {
  name: 'Send',
  mixins: [ serverMixin ],
  props: {
    address: String
  },
  data() {
    return {
      amount: '',
      destination: '',
      scan: false,
      scanner: null
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

  methods: {
    async send() {
      if(this.pow === null) {
        return alert('Please wait for the status to be ready')
      }
      const amount = NanoCurrency.convert(this.amount, this.nanoconv)
      const senderpublickey = NanoCurrency.derivePublicKey(this.privatekey)
      const sender = NanoCurrency.deriveAddress(senderpublickey,{useNanoPrefix:true}); 
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
      });
      console.log(block)
      let send = {}
      send['action'] = 'process'
      send['json_block'] = 'true'
      send['subtype'] = 'send'
      send['block'] = block.block
      await this.$store.dispatch('app/rpCall', send)
      this.$store.commit('app/pow', null)
      this.$emit('close', 'true')
    },
    closeScan () {
      this.scan = false
      this.scanner.stop()
    },
    async scanQR () {
      this.scan = true
      this.scanner = new Instascan.Scanner({ video: document.getElementById('qrpreview') })
      this.scanner.addListener('scan', function (content) {
        that.destination = content.replace('nano:','')
        that.closeScan()
      })
      let that = this
      Instascan.Camera.getCameras().then(function (cameras) {
        if (cameras.length > 0) {
          console.log('starting first camera')
          that.scanner.start(cameras[0])
        } else {
          console.error('No cameras found.')
        }
      }).catch(function (e) {
        console.error(e)
      })

    }
  }

}
</script>
