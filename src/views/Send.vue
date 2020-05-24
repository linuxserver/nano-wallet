<template>
  <div class="send">
    <div id="sendform">
        <label for="amount">Amount:</label>
        <input type="text" v-model="amount" id="amount" name="amount">
        <label for="destination">Destination:</label>
        <input type="text" v-model="destination" id="destination" name="destination">
      </div>
      <button class="sendfunds btn" @click="send" type="button">Send</button>
      <button class="scan btn outline" type="button">Scan QR</button>
  </div>
</template>

<script>
import { serverMixin } from '../mixins/serverMixin.js'
import * as NanoCurrency from 'nanocurrency'
import BigNumber from 'bignumber.js'

export default {
  name: 'Send',
  mixins: [ serverMixin ],
  props: {
    address: String
  },
  data() {
    return {
      amount: '',
      destination: ''
    }
  },
  computed: {
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
    async send() {
      if(this.pow === null) {
        return alert('Please wait for the status to be ready')
      }
      const amount = NanoCurrency.convert(this.amount, this.nanoconv)
      const senderpublickey = NanoCurrency.derivePublicKey(this.privatekey)
      const sender = NanoCurrency.deriveAddress(senderpublickey,{useNanoPrefix:true});  
      let info = {};
      info['action'] = 'account_info';
      info['representative'] = 'true';
      info['account'] = sender;
      const res = await this.$store.dispatch('app/rpCall', info);
      console.log(res);
      const balance = new BigNumber(res.balance).minus(new BigNumber(amount)).toFixed();
      const block = NanoCurrency.createBlock(this.privatekey, {
        work: this.pow,
        previous: res.frontier,
        representative: res.representative,
        balance: balance,
        link: this.destination
      });
      let send = {};
      send['action'] = 'process';
      send['json_block'] = 'true';
      send['subtype'] = 'send';
      send['block'] = block.block;
      const sendres = await this.$store.dispatch('app/rpCall', send);
      console.log(sendres);
      this.$store.commit('app/pow', null)
      this.$emit('close', 'true')
    }
  }

}
</script>