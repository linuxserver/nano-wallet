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
        <div v-if="loadingMsg" id="loadingMessage">{{ loadingMsg }}</div>
        <canvas id="canvas" hidden></canvas>
    </div>

  </div>
</template>

<script>
import { serverMixin } from '../mixins/serverMixin.js'
import * as NanoCurrency from 'nanocurrency'
import BigNumber from 'bignumber.js'
import jsQR from 'jsqr'

var video = document.createElement("video")

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
      scanner: null,
      canvas: null,
      stream: null,
      loadingMsg: 'Unable to access video stream (please make sure you have a webcam enabled)',
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
      this.$emit('close', 'true')
    },
    closeScan () {
      video.srcObject.getTracks().forEach(function(track) {
        track.stop()
      })
      this.scan = false

    },
    async scanQR () {
      this.scan = true


      var canvasElement = document.getElementById("canvas")
      this.canvas = canvasElement.getContext("2d")

      const that = this

      // Use facingMode: environment to attemt to get the front camera on phones
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(function(stream) {
        video.srcObject = stream
        video.setAttribute("playsinline", true) // required to tell iOS safari we don't want fullscreen
        video.play()
        requestAnimationFrame(tick)
      })

      function tick() {
        that.loadingMsg = "Loading video..."
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          that.loadingMsg = null
          canvasElement.hidden = false

          canvasElement.height = video.videoHeight
          canvasElement.width = video.videoWidth
          that.canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height)
          var imageData = that.canvas.getImageData(0, 0, canvasElement.width, canvasElement.height)
          var code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          })
          if (code) {
            video.srcObject.getTracks().forEach(function(track) {
              track.stop()
            })
            that.destination = code.data.replace('nano:','')
            that.scan = false
            return true
          }
        }
        if(that.scan === false) return
        requestAnimationFrame(tick)
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
