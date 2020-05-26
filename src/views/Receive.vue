<template>
  <div class="receive">
    <div class="address">Address: <span @click="copyToClipboard(address)" class="value"><i class="fad fa-clone"></i></span> <span @click="link('address',address)" class="value"><i class="fad fa-external-link"></i></span></div>
    <div class="address" v-html="highlightAddress(address)"></div>
    <canvas id="qrcode"></canvas>
  </div>
</template>

<script>
import { serverMixin } from '../mixins/serverMixin.js'
import QRCode from 'qrcode'

export default {
  name: 'Receive',
  mixins: [ serverMixin ],
  props: {
    address: String
  },
  data() {
    return {
      newrep: ''
    }
  },
  watch: {
    address: function (address) {
      if(address !== null) {
        QRCode.toCanvas(document.getElementById('qrcode'), 'nano:' + this.address, { width: 512 })
    
      }
    },
  }
}
</script>

<style lang="scss">
#qrcode {
  max-width: 100%;
  height: auto!important;
}
</style>
