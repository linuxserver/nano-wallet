<template>
  <div class="generate">
    <div class="details">
      <label for="seed">Seed</label>
      <a href="#" @click="copyToClipboard(walletdata.seed)" class="copy"><i class="fad fa-clone"></i></a>
      <input class="copytext" type="text" name="seed" :value="walletdata.seed" />
    </div>
    <div class="details">
      <label for="privatekey">Private Key</label>
      <a href="#" @click="copyToClipboard(walletdata.privatekey)" class="copy"><i class="fad fa-clone"></i></a>
      <input class="copytext" type="text" name="privatekey" :value="walletdata.privatekey" />
    </div>
    <div class="details">
      <label for="publickey">Public Key</label>
      <a href="#" @click="copyToClipboard(walletdata.publickey)" class="copy"><i class="fad fa-clone"></i></a>
      <input class="copytext" type="text" name="publickey" :value="walletdata.publickey" />
    </div>
    <div class="details">
      <label for="address">Address</label>
      <a href="#" @click="copyToClipboard(walletdata.address)" class="copy"><i class="fad fa-clone"></i></a>
      <input class="copytext" type="text" name="address" :value="walletdata.address" />
    </div>
    <canvas id="genqrcode"></canvas>
  </div>
</template>

<script>
import { serverMixin } from '../mixins/serverMixin.js'
import QRCode from 'qrcode'

export default {
  name: 'Generate',
  mixins: [ serverMixin ],
  props: {
    walletdata: Object
  },
  data() {
    return {
      newrep: ''
    }
  },
  watch: {
    walletdata: function (newwalletdata, old) {
      console.log(newwalletdata)
      console.log(old)
        QRCode.toCanvas(document.getElementById('genqrcode'), newwalletdata.address, { width: 512 })
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
