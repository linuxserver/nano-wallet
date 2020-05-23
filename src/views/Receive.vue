<template>
  <div class="receive">
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
        QRCode.toCanvas(document.getElementById('qrcode'), this.address, { width: 512 })
    
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