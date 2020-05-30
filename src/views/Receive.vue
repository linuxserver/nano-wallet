<template>
  <div class="receive inner">
    <div class="block">
      <div class="address">Address: <span @click="copyToClipboard(address)" class="value"><i class="fad fa-clone"></i></span> <span @click="link('address',address)" class="value"><i class="fad fa-external-link"></i></span></div>
      <div class="address" v-html="highlightAddress(address)"></div>
    </div>
    <div class="block">
      <div id="qrcode"></div>
    </div>
  </div>
</template>

<script>
import { serverMixin } from '../mixins/serverMixin.js'
import QRCodeStyling from 'qr-code-styling'

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
        const qrCode = new QRCodeStyling({
          width: 512,
          height: 512,
          data: 'nano:' + this.address,
          image: 'nano_logo.png',
          dotsOptions: {
            type: 'rounded'
          },
          imageOptions: {
            hideBackgroundDots: false
          }
        });
        qrCode.append(document.getElementById('qrcode'));
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
