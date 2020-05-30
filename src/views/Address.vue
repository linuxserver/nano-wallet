<template>
  <div style="top: 0;" id="wallet" class="page active">
    <div class="inner">
      <div class="block">
        <div class="headingtitle top"><span>Wallet</span></div>
        <div id="output">
          <div class="balance">
            <div @click="copyToClipboard($route.params.address)" :class="{ active: balanceextra }" class="raw">{{ $route.params.address }}</div>
            <div class="value" v-html="abbreviateNumber(balance)"></div>
            <div class="raw" :class="{ active: balanceextra }">{{ balance }}</div>
            <a class="balanceextra" href="" @click.prevent="balanceextra = !balanceextra"><i data-fa-transform="grow-20" class="fal fa-ellipsis-h"></i></a>
          </div>
        </div>
          <simplebar class="block history">
            <div class="headingtitle showmobile">History</div>
            <div id="pendingblocks"></div>
            <transaction
              v-for="(transaction, index) in pending"
              :key="index"
              :index="index"
              :transaction="transaction"
              v-on:blockdetails="blockdetails = $event"
              type="pending"
            ></transaction>
          </simplebar>
        </div>

          <simplebar class="block history">
            <div class="headingtitle hidemobile">History</div>

            <transaction
              v-for="(transaction, index) in history"
              :key="index"
              :index="index"
              :transaction="transaction"
              v-on:blockdetails="blockdetails = $event"
              :type="transaction.type"
            ></transaction>
          </simplebar>
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
import simplebar from 'simplebar-vue';
import 'simplebar/dist/simplebar.min.css';

export default {
  name: 'Address',
  components: {
    Transaction,
    BlockState,
    simplebar
  },
  mixins: [ serverMixin ],
  data() {
    return {
      details: null,
      balance: 0,
      blockdetails: null,
      balanceextra: false
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
    this.$store.dispatch('app/resetState')
    this.getDetails()

  }
}
</script>
