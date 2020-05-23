<template>
          <div v-if="blockstate !== null" id="breakdown">
          <header>State Block</header>
          <div class="stateblock">{{ details }}</div>
          <div class="block">
            <div class="title">Block subtype <span class="subtype value">{{ blockstate.subtype }}</span></div>
            <div class="label">The type of transaction that created this state block</div>
          </div>
          <div class="block">
            <div class="title">Account</div>
            <div class="account value">{{ blockstate.account }}</div>
            <div class="label">The account represented by this state block</div>
          </div>
          <div class="block">
            <div class="title">Amount <span class="amount value">{{ formattedValue }}</span></div>
            <div class="raw"><span class="amount_raw">{{ blockstate.amount }}</span> raw</div>
            <div class="label">The amount of NANO that was sent in this transaction</div>
          </div>
          <div class="block">
            <div class="title">Balance <span class="balance value">{{ blockstate.balance }}</span></div>
            <div class="raw"><span class="balance_raw"></span> raw</div>
            <div class="label">The amount of NANO that was sent in this transaction</div>
          </div>
          <div class="block">
            <div class="title">Representative <span class="representative value">{{ blockstate.contents.representative }}</span></div>
            <div class="label">The account's representative</div>
          </div>
          <div class="block">
            <div class="title">Recipient <span class="recipient value"></span>{{ blockstate.contents.link_as_account }}</div>
            <div class="label">The account that is receiving the transaction</div>
          </div>
          <div class="block">
            <div class="title">Date <span class="date value">{{ formattedDate }}</span></div>
            <div class="label">The date and time this block was discovered (converted to your local time)</div>
          </div>
          <div class="block">
            <div class="title">Previous Block <span class="previous value">{{ blockstate.contents.previous }}</span></div>
            <div class="label">The previous block in this account's chain</div>
          </div>
          <div class="block">
            <div class="title">Link <span class="link value">{{ blockstate.contents.link }}</span></div>
            <div class="label">The destination address encoded in hex format</div>
          </div>
          <div class="block">
            <div class="title">Proof of Work <span class="proof value">{{ blockstate.contents.work }}</span></div>
          </div>
          <div class="block">
            <div class="title">Signature <span class="signature value">{{ blockstate.contents.signature }}</span></div>
          </div>
          <div class="block">
            <div class="title">JSON</div>
            <div class="json">
              {{ JSON.stringify(blockstate, null, '\t') }}
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
    details: String
  },
  mixins: [ serverMixin ],
  data() {
    return {
      blockstate: null
    }
  },
  watch: {
    async details (newvalue) {
      if(newvalue !== null) {
        var blockinfo = {
          action: 'block_info',
          json_block: 'true',
          hash: newvalue
        }
        this.blockstate = await this.rpCall(blockinfo);
      } else {
        this.blockstate = null
      }
    }
  },
  computed: {
    formattedValue () {
      return this.abbreviateNumber(NanoCurrency.convert(this.blockstate.amount,this.rawconv), 5)
    },

    formattedDate () {
      let date = new Date(this.blockstate.local_timestamp * 1000); 
      return date.getDate() + ' ' + date.toLocaleString('default', { month: 'short' }) + ' ' + date.getFullYear()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
