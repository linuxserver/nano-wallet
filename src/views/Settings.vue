<template>
  <div class="settings">
    <div class="details">
        <label for="representative">Current Representative</label>
        <a href="#" class="copy" @click="copyToClipboard(representative)"><i class="fad fa-clone"></i></a>
        <input class="copytext" type="text" name="representative" :value="representative" />
    </div>
    <div class="details">
        <label for="newrep">Change Representative</label>
        <a href="#" class="copy" @click="copyToClipboard(newrep)"><i class="fad fa-clone"></i></a>
        <input class="newrep" type="text" v-model="newrep" name="newrep" />
    </div>
    <button @click="changeRep" class="repchange btn">Change Representative</button>
  </div>
</template>

<script>
import * as NanoCurrency from 'nanocurrency'

export default {
  name: 'Settings',
  props: {
    representative: String
  },
  data() {
    return {
      newrep: ''
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

    }
  }

}
</script>