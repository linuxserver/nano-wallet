<template>
  <div class="transaction" :class="transaction.type">
    <div class="type icon" :value="transaction.hash" @click="$emit('blockdetails', transaction.hash)">
      <i v-if="transaction.type === 'send'" class="fal fa-minus-circle"></i>
      <i v-else class="fal fa-plus-circle"></i>
    </div>
    <div class="innerdetails">
      <div class="amount">
        <div :title="rawValue" class="value" v-html="formattedValue"><i class="fal fa-coin"></i>
        </div>
        <div class="type">{{ transactionStatus(transaction.type) }}</div>
      </div>
      <div class="address">{{ formattedDate }} {{ abbreviateAddress(transaction.account) }}</div>
    </div>
  </div>
</template>

<script>
import * as NanoCurrency from 'nanocurrency'
import { serverMixin } from '../mixins/serverMixin.js'

export default {
  name: 'Transaction',
  props: {
    transaction: Object,
    type: String
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
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
</style>
