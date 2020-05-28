<template>
  <div class="settings inner">
    <div class="block">
    <div class="details">
        <label for="representative">Current Representative</label>
        <a href="#" class="copy" @click="copyToClipboard(representative)"><i class="fad fa-clone"></i></a>
        <div class="address" style="margin-bottom: 30px; background: #00000014; padding: 4px 14px;" v-html="highlightAddress(representative)"></div>
    </div>
    <div v-if="change" class="details">
        <label for="newrep">Change Representative</label>
        <input class="newrep" type="text" v-model="newrep" name="newrep" />
    </div>
    <div class="inline-buttons">
      <button v-if="!change" @click="change = true" class="repchange btn">Change Representative</button>
      <button v-if="change" @click="changeRep" class="repchange btn">Confirm</button>
      <button v-if="change" @click="change = false" class="repchange btn outline">Cancel</button>
    </div>
  </div>
  </div>
</template>

<script>
import * as NanoCurrency from 'nanocurrency'
import { serverMixin } from '../mixins/serverMixin.js'

export default {
  name: 'Settings',
  props: {
    representative: String
  },
  mixins: [ serverMixin ],
  data() {
    return {
      newrep: '',
      change: false
    }
  },
  computed: {
    pow () {
      return this.$store.state.app.pow
    },
    privatekey () {
      return this.$store.state.app.privatekey
    }

  },

  methods: {
    async changeRep () {
      if(this.pow === null) {
        return alert('Please wait for the status to be ready')
      }
      const publickey = NanoCurrency.derivePublicKey(this.privatekey)
      const address = NanoCurrency.deriveAddress(publickey,{useNanoPrefix:true})

      let infodetails = {};
      infodetails['action'] = 'account_info';
      infodetails['representative'] = 'true';
      infodetails['account'] = address;
      const info = await this.$store.dispatch('app/rpCall', infodetails)

      const blocktype = 'change';
      // const frontier = info.frontier;
      const previous = info.frontier;
      const balance = info.balance;
      const block = NanoCurrency.createBlock(this.privatekey, {
        work: this.pow,
        previous: previous,
        representative: this.newrep,
        balance: balance,
        link: '0000000000000000000000000000000000000000000000000000000000000000'
      });

      let repchange = {};
      repchange['action'] = 'process';
      repchange['json_block'] = 'true';
      repchange['subtype'] = blocktype;
      repchange['block'] = block.block;
      await this.$store.dispatch('app/rpCall', repchange)
      this.$emit('change', true)
    }
  }

}
</script>