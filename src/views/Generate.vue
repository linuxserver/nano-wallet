<template>
  <div id="genwallet" class="page active">
    <router-link class="close" :to="'/' + $route.params.node"><i class="fal fa-times"></i></router-link>
    <div class="inner">
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
      <button class="btn" @click="copyToClipboard('Seed: ' + walletdata.seed + '\nPrivate Key: ' + walletdata.privatekey + '\nPublic Key: ' + walletdata.publickey + '\nAddress: ' + walletdata.address)">Copy All</button>
      <div class="canvas-bag">
        <canvas id="genqrcode"></canvas>
      </div>
    </div>
  </div>
</template>

<script>
import { serverMixin } from '../mixins/serverMixin.js'
import QRCode from 'qrcode'

export default {
  name: 'Generate',
  mixins: [ serverMixin ],
  data() {
    return {
      newrep: '',
      walletdata: {}
    }
  },
  methods: {
    async seed () {
      return await this.getSeed()
    }
  },
  mounted () {
    this.getSeed().then(data => {
      this.walletdata = data
      QRCode.toCanvas(document.getElementById('genqrcode'), data.address, { width: 512 })
    }) 
  }
}
</script>

<style lang="scss">
</style>
<style lang="scss" scoped>
.btn {
  width: 100%;
}
.canvas-bag {
  text-align: center;
  margin-top: 20px;
}
</style>