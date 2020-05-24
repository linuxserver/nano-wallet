<template>
  <div style="top: 0;" id="wallet" class="page active">
        <div class="inner">
          <div class="headingtitle top"><span>Wallet</span></div>
          <div id="output">
            <div class="balance">
              <div class="value" v-html="abbreviateNumber(balance)"></div>
              <div class="raw">{{ balance }}</div>
            </div>
          </div>
          <div class="headingtitle">History</div>
          <div id="pendingblocks"></div>
          <transaction
            v-for="(transaction, index) in pending"
            :key="index"
            :index="index"
            :transaction="transaction"
            v-on:blockdetails="blockdetails = $event"
            type="pending"
          ></transaction>

          <transaction
            v-for="(transaction, index) in history"
            :key="index"
            :index="index"
            :transaction="transaction"
            v-on:blockdetails="blockdetails = $event"
            :type="transaction.type"
          ></transaction>
        </div>

  </div>
</template>

<script>
import Transaction from '@/components/Transaction.vue'
import { serverMixin } from '../mixins/serverMixin.js'
import * as NanoCurrency from 'nanocurrency'

export default {
  name: 'Address',
  components: {
    Transaction
  },
  mixins: [ serverMixin ],
  data() {
    return {
      details: null,
      balance: 0
    }
  },
  computed: {
    history () {
      return this.$store.state.app.history
    },
    pending () {
      return this.$store.state.app.pending
    },
  },

  watch: {
  },
  methods: {
    async getDetails () {
      const info = {
        action: 'account_info',
        representative: 'true',
        account: this.$route.params.address
      }
      console.log(info)
      this.details = await this.$store.dispatch('app/rpCall', info)
      this.$store.dispatch('app/history', this.$route.params.address)
      this.$store.dispatch('app/pending', this.$route.params.address)
      this.balance = NanoCurrency.convert(this.details.balance,this.rawconv);


    }
  },
  mounted() {
    this.$store.commit('app/node', this.$route.params.node)
    this.getDetails()

  }
}
</script>

<style lang="scss">
</style>