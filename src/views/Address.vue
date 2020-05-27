<template>
  <div style="top: 0;" id="wallet" class="page active">
        <div style="padding: 0" class="inner">
          <div class="headingtitle top"><span>Wallet</span></div>
          <div id="output">
            <div class="balance">
              <div @click="copyToClipboard($route.params.address)" class="raw">{{ this.$route.params.address }}</div>
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
        <div id="blockdetails" style="top: 0" class="page" :class="{active: blockdetails !== null}">
          <a class="close" @click="blockdetails = null"><i class="fal fa-times"></i></a>
          <block-state :details="blockdetails"></block-state>
        </div>

  </div>
</template>

<script>
import BlockState from '@/components/BlockState.vue'
import Transaction from '@/components/Transaction.vue'
import { serverMixin } from '../mixins/serverMixin.js'
import * as NanoCurrency from 'nanocurrency'

export default {
  name: 'Address',
  components: {
    Transaction,
    BlockState
  },
  mixins: [ serverMixin ],
  data() {
    return {
      details: null,
      balance: 0,
      blockdetails: null
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
      this.details = await this.$store.dispatch('app/getDetails', this.$route.params.address)
      this.$store.dispatch('app/history', this.$route.params.address)
      this.$store.dispatch('app/pending', this.$route.params.address)
      this.balance = NanoCurrency.convert(this.details.balance,this.rawconv);
      this.representative = this.details.representative;

    }
  },
  mounted() {
    this.$store.commit('app/resetState')
    this.$store.commit('app/node', this.$route.params.node)
    this.getDetails()

  }
}
</script>

<style lang="scss">
</style>
