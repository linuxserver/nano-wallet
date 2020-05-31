<template>
  <div :id="_uid"></div>
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
        qrCode.append(document.getElementById(this._uid));
      }
    },
  },

  methods: {

  }
}
</script>

