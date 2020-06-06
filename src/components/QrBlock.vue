<template>
  <div class="qrcode" :id="_uid"></div>
</template>

<script>
import QRCodeStyling from 'qr-code-styling'

export default {
  name: 'QrBlock',
  props: {
    address: String
  },
  data() {
    return {
    }
  },
  watch: {
    address: function (address) {
      if(address !== null) {
        const qrCode = new QRCodeStyling({
          width: 512,
          height: 512,
          data: address,
          image: 'qr_logo.png',
          dotsOptions: {
            type: 'rounded'
          },
          imageOptions: {
            hideBackgroundDots: false
          },
          qrOptions: {
            //errorCorrectionLevel: 'H'
          }
        });
        document.getElementById(this._uid).innerHTML = ''
        qrCode.append(document.getElementById(this._uid));
      }
    },
  },

  methods: {

  }
}
</script>

<style lang="scss">
.qrcode {
    max-width: 260px;
    width: 100%;
    height: auto !important;
    border-radius: 50%;
    padding: 40px;
    border: 5px solid #59c7f1;
    background: #fff;
}
</style>
