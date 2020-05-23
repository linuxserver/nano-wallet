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
  methods: {
    send() {
      
    }
  }

}
</script>