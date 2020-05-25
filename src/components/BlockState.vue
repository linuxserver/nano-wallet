<template>
          <div v-if="blockstate !== null" id="breakdown">
          <header>State Block</header>
          <div class="stateblock block">{{ hash }}</div>
          <div class="block">
            <div class="title">Block subtype <span class="subtype value">{{ blockstate.subtype }}</span></div>
            <div class="label">The type of transaction that created this state block</div>
          </div>
          <div class="block">
            <div class="title">Account <span @click="copyToClipboard(blockstate.contents.account)" class="value"><i class="fad fa-clone"></i></span></div>
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
            <div class="title">Representative <span @click="copyToClipboard(blockstate.contents.representative)" class="value"><i class="fad fa-clone"></i></span></div>
            <div><span class="rep_raw">{{ blockstate.contents.representative }}</span></div>
            <div class="label">The account's representative</div>
          </div>
          <div class="block">
            <div class="title">Recipient <span @click="copyToClipboard(blockstate.contents.representative)" class="value"><i class="fad fa-clone"></i></span></div>
            <div><span class="rec_raw">{{ blockstate.contents.link_as_account }}</span></div>
            <div class="label">The account that is receiving the transaction</div>
          </div>
          <div class="block">
            <div class="title">Date <span class="value">{{ formattedDate }}</span></div>
            <div class="label">The date and time this block was discovered (converted to your local time)</div>
          </div>
          <div class="block">
            <div class="title">Previous Block</div>
            <div>{{ blockstate.contents.previous }}</div>
            <div class="label">The previous block in this account's chain</div>
          </div>
          <div class="block">
            <div class="title">Link</div>
            <div>{{ blockstate.contents.link }}</div>
            <div class="label">The destination address encoded in hex format</div>
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
  
        </div>

</template>

<script>
import * as NanoCurrency from 'nanocurrency'
import { serverMixin } from '../mixins/serverMixin.js'

export default {
  name: 'BlockState',
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
      blockstate: null
    }
  },
  mounted() {
    if(this.static) {
      this.getDetails(this.$route.params.hash)
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
    },
    formattedValue (raw) {
      return this.abbreviateNumber(NanoCurrency.convert(raw,this.rawconv), 5)
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
