<template>
  <div class="receive inner">
    <div v-show="showset === false" class="block">
      <div class="address" @click="link('address',address)" v-html="highlightAddress(address)"></div>
      <qr-block :address="receive"></qr-block>
      <div class="receive-amount" v-if="set === true">Amount: {{ amount }}</div>
      <a @click.prevent="copyToClipboard(address)" class="btn">Copy Address</a>
      <a @click.prevent="setAmount()" class="btn outline">Set Amount</a>
    </div>
    <div v-show="showset !== false" class="block" style="padding: 0; margin-top: -47px;">
      <div class="amount"><input type="text" v-model="amount" /></div>
      <div class="keypad">
        <div class="row"><button @click="addNumber('7')">7</button><button @click="addNumber('8')">8</button><button @click="addNumber('9')">9</button></div>
        <div class="row"><button @click="addNumber('4')">4</button><button @click="addNumber('5')">5</button><button @click="addNumber('6')">6</button></div>
        <div class="row"><button @click="addNumber('1')">1</button><button @click="addNumber('2')">2</button><button @click="addNumber('3')">3</button></div>
        <div class="row"><button @click="backspace()"><i class="fal fa-backspace"></i></button><button @click="addNumber('0')">0</button><button @click="addNumber('.')">.</button></div>
      </div>
      <a @click.prevent="setReceive()" class="btn">Receive</a>
      <a @click.prevent="cancel()" class="btn outline">Cancel</a>
    </div>

  </div>
</template>

<script>
import { serverMixin } from '../mixins/serverMixin.js'
import QrBlock from '../components/QrBlock'
import * as NanoCurrency from 'nanocurrency'

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
      newrep: '',
      amount: '0',
      set: false,
      showset: false,
      receive: null
    }
  },
  watch: {
    address: function (newaddress) {
      this.receive = 'nano:' + newaddress
    }
  },
  computed: {
  },
  methods: {
    setAmount () {
      this.showset = true
    },
    addNumber (number) {
      if(this.amount === '0') {
        this.amount = number
        return
      } 
      this.amount = this.amount + number
    },
    backspace () {
      let amount = this.amount.slice(0, -1)
      if(amount.length <= 0) amount = '0'
      this.amount = amount
    },
    cancel () {
      this.amount = '0'
      this.receive = 'nano:' + this.address
      this.set = false
      this.showset = false

    },
    setReceive () {
      if(this.amount === '0') {
        this.receive = 'nano:' + this.address
        this.set = false
        this.showset = false
        return false
      }
      let rawamount = NanoCurrency.convert(this.amount, this.nanoconv)
      this.receive = 'nano:' + this.address + '?amount=' + rawamount
      this.set = true
      this.showset = false

      return true
    }
  }
}
</script>
