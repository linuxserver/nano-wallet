<template>
  <div class="receive inner">
    <div v-show="showset === false" class="block">
      <div class="address" @click="link('address',address)" v-html="highlightAddress(address)"></div>
      <qr-block :address="receive"></qr-block>
      <div class="receive-amount" v-if="set === true">Amount: {{ amount }}</div>
      <a v-if="clipboard === true" @click.prevent="copyToClipboard(address)" class="btn">Copy Address</a>
      <a @click.prevent="setAmount()" class="btn outline">Set Amount</a>
      <a @click.prevent="clearReceive()" class="btn outline">Clear Amount</a>
    </div>
    <div v-show="showset !== false" class="block" style="padding: 0; margin-top: -47px;">
      <div class="amount"><input type="text" @keypress="isNumber($event)" @paste="isNumber($event)" ref="amount" v-model="amount" /></div>
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
import BigNumber from 'bignumber.js'

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
      amount: '0', // Amount needs to be a string for the buttons to work
      set: false,
      showset: false,
      receive: null,
      clipboard: true,
      pendingpoll: null
    }
  },
  watch: {
    address: function (newaddress) {
      this.receive = 'nano:' + newaddress
      // address isn't set initially, so wait for it to populate then get current pending list
      this.$store.dispatch('app/pending', this.address)
    },
    showset: function (current) {
      if (current === true) {
        this.$nextTick(function () {
          this.$refs.amount.focus()
        })
      }
    },
    receive: function () {
      if (this.$route.name == 'POS' && this.amount !== '0') {
        const that = this
        let currentpending
        let newpending
        let currentkeys
        let newkeys
        this.pendingpoll = setInterval(async function(){
          if (that.$route.name == 'POS' && that.amount <= '0') {
            that.amount = '0'
            that.setReceive()
            clearInterval(that.pendingpoll)
          }                  
          currentpending = that.pending
          await that.$store.dispatch('app/pending', that.address)
          that.$nextTick(function () {
            newpending = that.pending
            if (JSON.stringify(currentpending) !== JSON.stringify(newpending)) {
              currentkeys = Object.keys(currentpending)
              newkeys = Object.keys(newpending)
              for (const key of newkeys) {
                if(currentkeys.indexOf(key) === -1) {
                  const amountNano = NanoCurrency.convert(newpending[key].amount,that.rawconv)
                  if (amountNano > that.amount) {
                    that.amount = '0'
                  } else {
                    that.amount = new BigNumber(that.amount).minus(new BigNumber(amountNano)).toFixed()
                  }
                  that.setReceive()
                  that.$notify({
                    title: 'Funds delivered: ' + amountNano,
                    text: 'Sent from '+ that.abbreviateAddress(newpending[key].source, false),
                    type: 'success'
                  })
                  if (that.amount !== '0') {
                    clearInterval(that.pendingpoll)
                  }
                }
              }
            }
          })
        }, this.$store.state.app.settings.receiveinterval)
      } else {
        clearInterval(this.pendingpoll)
      }
    }
  },
  computed: {
    pending () {
      return this.$store.state.app.pending
    }
  },
  beforeDestroy: function () {
    // make sure interval is cleared
    clearInterval(this.pendingpoll)
  },
  methods: {
    isNumber: function(evt) {
      console.log(evt)
      var charCode = (evt.which) ? evt.which : evt.keyCode;
      if (charCode == 46) {
        //Check if the text already contains the . character
        console.log(this.amount.indexOf('.'))
        if (this.amount.indexOf('.') === -1) {
          return true
        } else {
          evt.preventDefault()
        }
      } else {
        if (charCode > 31 &&
          (charCode < 48 || charCode > 57))
          evt.preventDefault()
      }
      if (evt.key === '0' && this.amount === '0') {
        evt.preventDefault()
      }
      if (evt.key !== '0' && this.amount === '0') {
        this.amount = evt.key
        evt.preventDefault()
      }
      return true;

    },
    setAmount () {
      this.showset = true
    },
    addNumber (number) {
      if(this.amount === '0') {
        if(number !== '.') {
          this.amount = number
          this.$refs.amount.focus()
          return
        }
      } 
      if (number === '.' && this.amount.indexOf('.') !== -1) {
        this.$refs.amount.focus()
        return
      }
      this.amount = this.amount + number
      this.$refs.amount.focus()
    },
    backspace () {
      let amount = this.amount.slice(0, -1)
      if(amount.length <= 0) amount = '0'
      this.amount = amount
      this.$refs.amount.focus()
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
      // make sure it's a valid number
      if (!this.checkamount(rawamount)) {
        return false
      }

      this.receive = 'nano:' + this.address + '?amount=' + rawamount
      this.set = true
      this.showset = false

      return true
    },
    clearReceive () {
      this.receive = 'nano:' + this.address
      this.set = false
      this.showset = false
      this.amount = '0' // Amount needs to be a string for the buttons to work
    }
  },
  mounted () {
    if (this.$route.name == 'POS') {
     // this.receive = true
     this.closebutton = false
     this.amount = '0' // Amount needs to be a string for the buttons to work
     this.clipboard = false
    }
  }
}
</script>
