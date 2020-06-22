<template>
        <simplebar v-if="blockstate !== null" id="breakdown">
          <header class="headingtitle">State Block <span @click="copyToClipboard(hash)" class="value"><i class="fad fa-clone"></i></span><span @click="link('block',hash)" class="value"><i class="fad fa-external-link"></i></span></header>
          <div class="stateblock block">{{ hash }}</div>
          <div class="block">
            <div class="title">Block subtype <span class="subtype value">{{ blockstate.subtype }}</span></div>
            <div class="label">The type of transaction that created this state block</div>
          </div>
          <div class="block">
            <div class="title">Metadata <span @click="copyToClipboard(metadatahex)" class="value"><i class="fad fa-clone"></i></span><span @click="showmetaform()" v-show="addmeta !== false" class="value"><i class="fal fa-plus-circle"></i> Add Metadata</span><span v-show="addmeta !== true" @click="metalink()" class="value"><i class="fad fa-external-link"></i></span></div>
            <div v-if="metaform !== false" class="login">
              <input type="text" v-model="metadata" placeholder="THIS IS PERMANENT" id="metadata" :maxlength="metaformmax" name="metadata">
              <span  @click="setmeta()" class="max" v-text="(metaformmax - metadata.length) + ' SET'"></span>
            </div>
            <div v-if="showspinner !== false"><i class="fas fa-spinner fa-spin"></i></div>
            <div class="account" v-text="metadatahex"></div>
            <div class="account" v-text="metadatautf8"></div>
            <div class="label">Off chain metadata attached to this transaction</div>
          </div>
          <div class="block">
            <div class="title">Account <span @click="copyToClipboard(blockstate.contents.account)" class="value"><i class="fad fa-clone"></i></span><span @click="link('address',blockstate.contents.account)" class="value"><i class="fad fa-external-link"></i></span></div>
            <div class="account">{{ blockstate.contents.account }}</div>
            <div class="label">The account represented by this state block</div>
          </div>
          <div class="block">
            <div class="title">Amount <span class="amount value" v-html="formattedValue(blockstate.amount)"></span></div>
            <div class="raw"><span class="amount_raw">{{ blockstate.amount }}</span> raw</div>
            <div class="label">The amount of NANO that was sent in this transaction</div>
          </div>
          <div class="block">
            <div class="title">Balance <span class="balance value" v-html="formattedValue(blockstate.balance)"></span></div>
            <div class="raw"><span class="balance_raw">{{ blockstate.balance }}</span> raw</div>
            <div class="label">The amount of NANO that was sent in this transaction</div>
          </div>
          <div class="block">
            <div class="title">Representative <span @click="copyToClipboard(blockstate.contents.representative)" class="value"><i class="fad fa-clone"></i></span><span @click="link('address',blockstate.contents.representative)" class="value"><i class="fad fa-external-link"></i></span></div>
            <div><span class="rep_raw">{{ blockstate.contents.representative }}</span></div>
            <div class="label">The account's representative</div>
          </div>
          <div class="block">
            <div class="title">Recipient <span @click="copyToClipboard(blockstate.contents.representative)" class="value"><i class="fad fa-clone"></i></span> <span @click="link('address',blockstate.contents.link_as_account)" class="value"><i class="fad fa-external-link"></i></span></div>
            <div><span class="rec_raw">{{ blockstate.contents.link_as_account }}</span></div>
            <div class="label">The account that is receiving the transaction</div>
          </div>
          <div class="block">
            <div class="title">Date <span class="value">{{ formattedDate }}</span></div>
            <div class="label">The date and time this block was discovered (converted to your local time)</div>
          </div>
          <div class="block">
            <div class="title">Previous Block <span @click="link('block',blockstate.contents.previous)" class="value"><i class="fad fa-external-link"></i></span></div>
            <div>
              {{ blockstate.contents.previous }}
            </div>
            <div class="label">The previous block in this account's chain</div>
          </div>
          <div class="block">
            <div class="title">Link</div>
            <div>{{ blockstate.contents.link }}</div>
            <div class="label">The destination address encoded in hex format or the block hash if open</div>
          </div>
          <div class="block">
            <div class="title">Proof of Work</div>
            <div>{{ blockstate.contents.work }}</div>
          </div>
          <div class="block">
            <div class="title">Signature</div>
            <div>{{ blockstate.contents.signature }}</div>
          </div>
          <div class="block">
            <div class="title">JSON <span @click="copyToClipboard(JSON.stringify(blockstate))" class="value"><i class="fad fa-clone"></i></span></div>
            <div class="json">
              <pre>{{ JSON.stringify(blockstate, null, 4) }}</pre>
            </div>
          </div>
  
        </simplebar>

</template>

<script>
import * as NanoCurrency from 'nanocurrency'
import { serverMixin } from '../mixins/serverMixin.js'
import simplebar from 'simplebar-vue'
import 'simplebar/dist/simplebar.min.css'
import { blake2sHex } from 'blakejs'

export default {
  name: 'BlockState',
  components: {
    simplebar
  },
  props: {
    details: {
      default: null,
      type: String
    },
    static: {
      default: false,
      type: Boolean
    }
  },
  mixins: [ serverMixin ],
  data() {
    return {
      hash: null,
      blockstate: null,
      net: null,
      metadatahex: '',
      metadatautf8: '',
      addmetadata: false,
      metaform: false,
      metaformmax: 32,
      metadata: '',
      addmeta: false,
      showspinner: false
    }
  },
  mounted() {
    if(this.static) {
      this.getDetails(this.$route.params.hash)
    }
    if (this.$store.state.app.node.address.split('.').slice(-2)[0] == 'linuxserver') {
      this.net = 'lsio'
    } else {
      this.net = 'live'
    }
  },
  watch: {
    async details (newvalue) {
      if(newvalue !== null) {
        this.getDetails(newvalue)
      } else {
        this.blockstate = null
      }
    }
  },
  methods: {
    async getDetails(hash) {
      var blockinfo = {
        action: 'block_info',
        json_block: 'true',
        hash: hash
      }
      this.hash = hash
      this.blockstate = await this.$store.dispatch('app/rpCall', blockinfo);
      this.metadatahex = ''
      this.metadatautf8 = ''
      this.metaform = false
      this.metadata = ''
      this.showspinner = false
      const response = await fetch('https://www.nanometadata.com/' + this.hash)
      if (response.ok) {
        this.addmeta = false
        const payload = await response.text()
        const hexmetadata = payload.substring(192)
        this.metadatahex = 'HEX: ' + hexmetadata
        this.metadatautf8 = 'UTF8: ' + new Buffer(hexmetadata, 'hex').toString('utf8')
      } else {
        if (this.$route.name !== 'Block') {
          this.addmeta = true
        }
        this.metadatahex = 'None Found'
      }
    },
    formattedValue (raw) {
      return this.abbreviateNumber(NanoCurrency.convert(raw,this.rawconv), 5)
    },
    showmetaform () {
      this.metaform = !this.metaform
      return true
    },
    async setmeta () {
      if (this.metadata) {
        this.metaform = false
        this.showspinner = true
        const privkey = this.$store.state.app.privatekey
        const hex = Buffer(this.metadata).toString('hex')
        const hash = blake2sHex(this.hash + hex).toUpperCase()
        const pubkey = NanoCurrency.derivePublicKey(privkey)
        const sig = NanoCurrency.signBlock({ hash: hash, secretKey: privkey })
        const params = 'trans=' + this.hash + '&data=' + hex + '&pub=' + pubkey + '&sig=' + sig + '&net=' + this.net
        const apiurl = 'https://api.nanometadata.com/metadata?' + params
        const response = await fetch(apiurl)
        const apires = await response.text()
        if (response.ok) {
          this.$notify({
            title: 'Transaction signed',
            text: 'Transaction has been signed at nanometadata.com',
            type: 'success'
          })
          this.getDetails(this.hash)
        } else {
          this.$notify({
            title: 'Cannot sign transaction',
            text: apires,
            type: 'error'
          })
        }
      } else {
        this.$notify({
          title: 'Metadata Not Set',
          text: 'Please set some metadata',
          type: 'error'
        })
      }
    },
    metalink () {
      window.open('https://www.nanometadata.com/' + this.hash)
    }
  },
  computed: {

    formattedDate () {
      let date = new Date(this.blockstate.local_timestamp * 1000); 
      return date.getDate() + ' ' + date.toLocaleString('default', { month: 'short' }) + ' ' + date.getFullYear() + ' - ' + date.toLocaleTimeString()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
#app .page {
  padding: 30px;
}
</style>
