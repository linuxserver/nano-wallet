<template>
  <div class="receive inner">
    <div class="block">
      <div class="address" @click="link('address',address)" v-html="highlightAddress(address)"></div>
      <qr-block :address="'nano:' + address"></qr-block>
      <a @click="copyToClipboard(address)" class="btn">Copy Address</a>
    </div>
  </div>
</template>

<script>
import { serverMixin } from '../mixins/serverMixin.js'
import QrBlock from '../components/QrBlock'

export default {
  name: 'Receive',
  mixins: [ serverMixin ],
  components: {
    QrBlock
  },
  props: {
    address: String
  },
  data() {
    return {
      newrep: ''
    }
  },
  watch: {
  }
}
</script>
