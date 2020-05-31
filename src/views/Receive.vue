<template>
  <div class="receive inner">
    <div class="block">
      <div class="address">Address: <span @click="copyToClipboard(address)" class="value"><i class="fad fa-clone"></i></span> <span @click="link('address',address)" class="value"><i class="fad fa-external-link"></i></span></div>
      <div class="address" v-html="highlightAddress(address)"></div>
    </div>
    <div class="block">
      <qr-block :address="'nano:' + address"></qr-block>
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

<style lang="scss">
#qrcode {
  max-width: 100%;
  height: auto!important;
}
</style>
