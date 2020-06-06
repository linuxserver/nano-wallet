<template>
  <div id="genwallet" class="page active">
    <router-link class="close" :to="$store.getters['app/nodeLink']"><i class="fal fa-times"></i></router-link>
    <div class="inner">
      <div class="block">
        <div class="details smaller">
          <label for="seed">Seed</label>
          <a href="#" @click="copyToClipboard(seed)" class="copy"><i class="fad fa-clone"></i></a>
          <div class="login">
            <input class="copytext" type="text" v-model="seed" name="seed" />
            <span @click="clearWallet" class="max">CLEAR</span>
          </div>
        </div>
        <div class="details smaller">
          <label for="address">Address</label>
          <a href="#" @click="copyToClipboard(address)" class="copy"><i class="fad fa-clone"></i></a>
          <input class="copytext" type="text" v-model="address" name="address" />
        </div>
        <button class="btn" @click="copyToClipboard('Seed: ' + seed + '\nPrivate Key: ' + privatekey + '\nPublic Key: ' + publickey + '\nAddress: ' + address)">Copy All</button>
        <wallet :private="seed" :public="address"></wallet>
      </div>
      <div class="block">
        <div class="canvas-bag">
          <qr-block :address="'nanoseed:' + seed"></qr-block>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { serverMixin } from '../mixins/serverMixin.js'
import QrBlock from '../components/QrBlock'
import Wallet from '../components/Wallet'

export default {
  name: 'Generate',
  mixins: [ serverMixin ],
  components: {
    QrBlock,
    Wallet
  },
  data() {
    return {
      newrep: '',
      seed: '',
      privatekey: '',
      publickey: '',
      address: '',
      walletdata: {}
    }
  },
  watch: {
    seed: function (newseed, oldseed) {
      if(newseed !== oldseed && newseed.length === 64) {
        this.$store.dispatch('app/seedData', newseed).then(data => {
          this.seed = data.seed,
          this.privatekey = data.privatekey,
          this.publickey = data.publickey,
          this.address = data.address
        }) 
      }
    }
  },
  methods: {
    clearWallet () {
      this.seed = ''
      this.address = ''
    }
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
      this.seed = data.seed,
      this.privatekey = data.privatekey,
      this.publickey = data.publickey,
      this.address = data.address
    }) 
  }
}
</script>

<style lang="scss">
</style>
<style lang="scss" scoped>
.btn {
  width: 100%;
  margin-bottom: 15px;
}
.canvas-bag {
  text-align: center;
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
#genwallet {
  .login {
    .max {
      height: 46px;
    }
  }
}
</style>
