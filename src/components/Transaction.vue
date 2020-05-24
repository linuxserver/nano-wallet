<template>
  <div class="transaction" :class="type">
    <div class="type icon" :value="transaction.hash" @click="$emit('blockdetails', transaction.hash)">
      <i v-if="transaction.type === 'send'" class="fal fa-minus-circle"></i>
      <i v-else-if="transaction.type === 'pending'" class="fal fa-exclamation-circle"></i>
      <i v-else class="fal fa-plus-circle"></i>
    </div>
    <div class="innerdetails">
      <div class="amount">
        <div :title="rawValue" class="value" v-html="formattedValue"><i class="fal fa-coin"></i>
        </div>
        <div v-if="type !== 'pending'" class="type">{{ transactionStatus(transaction.type) }}</div>
        <div v-if="type === 'pending'" class="type">
          <button v-if="privatekey !== null" @click="receive" class="pocket">Receive</button>
          <div v-else class="">Pending</div>
        </div>
      </div>
      <div class="address">
        <span v-if="type !== 'pending'">{{ formattedDate }} {{ abbreviateAddress(transaction.account) }}</span>
        <span v-if="type === 'pending'">{{ abbreviateAddress(transaction.source) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import * as NanoCurrency from 'nanocurrency'
import { serverMixin } from '../mixins/serverMixin.js'
import BigNumber from 'bignumber.js'

export default {
  name: 'Transaction',
  props: {
    transaction: Object,
    type: String,
    index: [Number, String],
  },
  mixins: [ serverMixin ],
  computed: {
    rawValue () {
      return NanoCurrency.convert(this.transaction.amount,this.rawconv)
    },
    formattedValue () {
      return (this.transaction.type === 'send' ? '-' : '+' ) + this.abbreviateNumber(NanoCurrency.convert(this.transaction.amount,this.rawconv), 5)
    },
    formattedDate () {
      let date = new Date(this.transaction.local_timestamp * 1000); 
      return date.getDate() + ' ' + date.toLocaleString('default', { month: 'short' }) + ' ' + date.getFullYear()
    },
    pow () {
      return this.$store.state.app.pow
    },
    ready () {
      return this.$store.state.app.ready
    },
    privatekey () {
      return this.$store.state.app.privatekey
    }

  },
  methods: {
    async receive () {
      if(this.pow === null) {
        return alert('Please wait for the status to be ready')
      }

      const publickey = NanoCurrency.derivePublicKey(this.privatekey)
      const address = NanoCurrency.deriveAddress(publickey,{useNanoPrefix:true})
      let infodetails = {}
      infodetails['action'] = 'account_info'
      infodetails['representative'] = 'true'
      infodetails['account'] = address
      const info = await this.$store.dispatch('app/rpCall', infodetails)

      let startingbalance = '0'
      let blocktype = 'open'
      // let frontier = publickey; // Value is never used
      let previous = '0000000000000000000000000000000000000000000000000000000000000000'
      let rep = address

      if ('balance' in info){
        startingbalance = info.balance;
        blocktype = 'receive';
        // frontier = info.frontier; // Value is never used
        previous = info.frontier;
        rep = info.representative;
      }

      var balance = new BigNumber(startingbalance).plus(new BigNumber(this.transaction.amount)).toFixed();
      var block = NanoCurrency.createBlock(this.privatekey, {
        work: this.pow,
        previous: previous,
        representative: rep,
        balance: balance,
        link: this.index
      });
      var receive = {};
      receive['action'] = 'process';
      receive['json_block'] = 'true';
      receive['subtype'] = blocktype;
      receive['block'] = block.block;
      await this.$store.dispatch('app/rpCall', receive)
      this.$store.commit('app/pow', null)

    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
