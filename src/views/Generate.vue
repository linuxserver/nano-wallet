<template>
  <div id="genwallet" class="page active">
    <router-link class="close" :to="$store.getters['app/nodeLink']"><i class="fal fa-times"></i></router-link>
    <div class="inner">
      <div class="block">
        <div class="details smaller">
          <label for="seed">Seed</label>
          <a href="#" @click="copyToClipboard(walletdata.seed)" class="copy"><i class="fad fa-clone"></i></a>
          <input class="copytext" type="text" name="seed" :value="walletdata.seed" />
        </div>
        <div class="details smaller">
          <label for="privatekey">Private Key</label>
          <a href="#" @click="copyToClipboard(walletdata.privatekey)" class="copy"><i class="fad fa-clone"></i></a>
          <input class="copytext" type="text" name="privatekey" :value="walletdata.privatekey" />
        </div>
        <div class="details smaller">
          <label for="publickey">Public Key</label>
          <a href="#" @click="copyToClipboard(walletdata.publickey)" class="copy"><i class="fad fa-clone"></i></a>
          <input class="copytext" type="text" name="publickey" :value="walletdata.publickey" />
        </div>
        <div class="details smaller">
          <label for="address">Address</label>
          <a href="#" @click="copyToClipboard(walletdata.address)" class="copy"><i class="fad fa-clone"></i></a>
          <input class="copytext" type="text" name="address" :value="walletdata.address" />
        </div>
        <button class="btn" @click="copyToClipboard('Seed: ' + walletdata.seed + '\nPrivate Key: ' + walletdata.privatekey + '\nPublic Key: ' + walletdata.publickey + '\nAddress: ' + walletdata.address)">Copy All</button>
      </div>
      <div class="block">
        <div class="canvas-bag">
          <qr-block :address="'nanoseed:' + walletdata.seed"></qr-block>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { serverMixin } from '../mixins/serverMixin.js'
import QrBlock from '../components/QrBlock'

export default {
  name: 'Generate',
  mixins: [ serverMixin ],
  components: {
    QrBlock
  },
  data() {
    return {
      newrep: '',
      walletdata: {}
    }
  },
  methods: {
  },
  computed: {
    genWalletLink () {
      if('node' in this.$route.params) {
        return this.$route.params.node
      }
      return ''
    }

  },
  mounted () {
    this.$store.dispatch('app/getSeed').then(data => {
      this.walletdata = data
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
  display: flex;
  justify-content: center;
}
</style>
