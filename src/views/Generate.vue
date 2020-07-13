<template>
  <div id="genwallet" class="page active">
    <router-link class="close" :to="$store.getters['app/nodeLink']"><i class="fal fa-times"></i></router-link>
    <!--<div class="inner">-->
      <div class="block">
        <div class="details smaller">
          <label for="seed">Seed <a class="refreshwallet" @click.prevent="refreshWallet" href=""><i class="fal fa-sync"></i></a></label>
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
        <button style="margin-top: 30px;" class="btn" @click="copyToClipboard('Seed: ' + seed + '\nPrivate Key: ' + privatekey + '\nPublic Key: ' + publickey + '\nAddress: ' + address)">Copy To Clipboard</button>
        <button class="btn outline" @click="save('Seed: ' + seed + '\nPrivate Key: ' + privatekey + '\nPublic Key: ' + publickey + '\nAddress: ' + address)">Download</button>
        <wallet :private="seed" :public="address"></wallet>
        <div class="details smaller padtop">
          <label for="phrase">EXPERIMENTAL PhaseFile <a @click="openPhrasefilegen"><i class="fal fa-exclamation-circle"></i></a></label>
          <input class="copytext" type="text" v-model="phrase" name="phrase" />
          <label for="fileupload" class="btn outline">Seed File</label>
          <input type="file" id="fileupload" style="display:none;" />
          <button @click="seedfromphrase" class="btn outline" >PhraseFile Generate</button>
        </div>
      </div>
      <div class="page" style="z-index: 9;" :class="{active: aboutphrasegen !== false}">
        <a class="close" @click="closePhrasefilegen"><i class="fal fa-times"></i></a>
        <p>Before you use this method to generate your seed you should have a firm grasp on what is happening on the backend. This generation method will shasum a file or a phrase or the combination of the two sums and use that as the seed for your account. In general human beings are incapable of creating a cryptographically secure phrases which is why BIP39 exists, at the least you should use a file + phrase to generate. While using this method have the underlying expectation that the funds using this seed have a chance to be stolen and only ever use it for small daily transactional amounts. You should also treat the file you are using for this method the same you would as a local wallet data file. When coming up with a phrase length and complexity is the key. Do not use known quotes or sayings or popular files and try to use capitalization and special characters where you will remember them.</p>
      </div>
  </div>
</template>

<script>
import { serverMixin } from '../mixins/serverMixin.js'
// import QrBlock from '../components/QrBlock'
import Wallet from '../components/Wallet'

export default {
  name: 'Generate',
  mixins: [ serverMixin ],
  components: {
    // QrBlock,
    Wallet
  },
  data() {
    return {
      newrep: '',
      seed: '',
      privatekey: '',
      publickey: '',
      address: '',
      walletdata: {},
      phrase: '',
      aboutphrasegen: false
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
    save (data) {
      const filename = this.abbreviateAddress(this.address, false) + '.txt'
      var blob = new Blob([data], {type: 'text/csv'});
      if(window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
      }
      else{
        var elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;        
        document.body.appendChild(elem);
        elem.click();        
        document.body.removeChild(elem);
      }
    },
    clearWallet () {
      this.seed = ''
      this.address = ''
    },
    refreshWallet () {
      this.$store.dispatch('app/getSeed').then(data => {
        this.seed = data.seed,
        this.privatekey = data.privatekey,
        this.publickey = data.publickey,
        this.address = data.address
      }) 

    },
    async seedfromphrase () {
      const that = this
      const fileitem = document.getElementById('fileupload').files[0]
      if (fileitem) {
        const reader = new FileReader()
        reader.readAsArrayBuffer(fileitem)
        reader.onload = async function(file) {
          const filebytes = file.target.result
          const shasum = await that.shasum(that.phrase,filebytes)
          that.seed = shasum
        }
      } else if (that.phrase) {
        const shasum = await that.shasum(that.phrase,null)
        that.seed = shasum
      } else {
        that.$notify({
          title: 'Error',
          text: 'You must set one or both of file or phrase to use this',
          type: 'error'
        })
      }
    },
    closePhrasefilegen () {
      this.aboutphrasegen = false
    },
    openPhrasefilegen () {
      this.aboutphrasegen = true
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
.refreshwallet {
  color: #59c7f1;
  margin-left: 15px;
}
#genwallet {
  .login {
    .max {
      height: 37px;
    }
  }
}
.details .copy {
    right: -21px;
    top: 40px;
}
</style>
