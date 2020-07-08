<template>
  <div class="send">
    <div class="labeltabs">
      <label @click="setSend" class="df" :class="{ active: sendtab === true}">
        Send
      </label>
      <label @click="setCheckout" class="df" :class="{ active: sendtab !== true}">
        Checkout
      </label>
    </div>
    <div v-show="checkout !== false" id="checkoutform">
      <div v-text="checkoutheader"></div>
      <div v-if="emailform !== false">
        <label for="email">Email:</label>
        <input data-regexp="^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$" data-error="Please Enter Valid Email" v-bind="emailattrs" type="text" id="email" name="email" class="checkout">
      </div>
      <div v-if="nameform !== false">
        <label for="name">Name:</label>
        <input v-bind="nameattrs" type="text" id="name" name="name" class="checkout">
      </div>
      <div v-if="addressform !== false">
        <label for="address1">Address:</label>
        <input v-bind="addressattrs" type="text" id="address1" name="address1" class="checkout" placeholder="Street Address">
        <label for="address2">Address 2:</label>
        <input type="text" id="address2" name="address2" class="checkout" placeholder="Apt or Box #">
        <label for="country">Country:</label>
        <country-select v-bind="addressattrs" v-model="country" id="country" name="country" :country="country" topCountry="US" class="checkout"/>
        <label for="region">Region:</label>
        <region-select v-bind="addressattrs" v-model="region" id="region" name="region" :country="country" :region="region" class="checkout"/>
        <label for="city">City:</label>
        <input v-bind="addressattrs" type="text" id="city" name="city" class="checkout" placeholder="Local City">
        <label for="zip">Postal Code:</label>
        <input v-bind="addressattrs" type="text" id="zip" name="zip" class="checkout" placeholder="Local Postal Code">
      </div>
      <div v-if="customform !== false">
        <div v-for="input in custominputs" :key="input.name">
          <label :for="input.name">{{ input.label }}:</label>
          <input type="text" :id="input.name" :name="input.name" class="checkout" :required="input.required" :placeholder="input.placeholder">
        </div>
      </div>
    </div>
    <div v-show="checkout === false && sendtab === true" id="sendform">
      <label for="amount">Amount:</label>
      <div class="login">
        <input type="text" v-model="amount" id="amount" name="amount">
        <span  @click="setmax" class="max">MAX</span>
      </div>
      <label for="destination">Destination:</label>
      <input type="text" v-model="destination" id="destination" name="destination">
    </div>
    <div v-if="checkout === false && sendtab === false">
      <label for="amount">Checkout Template URL:</label>
      <input type="text" v-model="formurl" id="formurl" name="formurl">
    </div>
    <button v-if="sendtab === false && checkout === false" class="btn sendfunds" @click="renderform" type="button">Checkout</button>
    <scan-qr v-if="checkout === false" @scanned="scanDone"></scan-qr>
    <scan-nfc v-if="nfcsup !== false && checkout === false" @scanned="scanDone"></scan-nfc>
    <button v-if="(sendtab === true && checkout === false) || (sendtab === false && checkout === true)" class="sendfunds btn" @click="send" type="button">Send</button>
  </div>
</template>

<script>
import { serverMixin } from '../mixins/serverMixin.js'
import * as NanoCurrency from 'nanocurrency'
import BigNumber from 'bignumber.js'
import ScanQr from '../components/ScanQr.vue'
import ScanNfc from '../components/ScanNfc.vue'
import yaml from 'yaml-js'

function sendInitial (){
  return {
    amount: '',
    destination: '',
    nfcsup: false,
    product: '',
    checkout: false,
    checkoutheader: '',
    emailform: false,
    emailattrs: {},
    addressform: false,
    addressattrs: {},
    nameform: false,
    nameattrs: {},
    country: '',
    region: '',
    customform: false,
    custominputs: [],
    payload: {},
    payloadhash: '',
    net: '',
    formsource: 'https://www.nanocheckout.com/templates/',
    formurl: '',
    sendtab: true,
    checkoutapi: 'https://api.nanocheckout.com/order'
  }
}


export default {
  name: 'Send',
  mixins: [ serverMixin ],
  components: {
    ScanQr,
    ScanNfc
  },
  props: {
    address: String,
    open: Boolean
  },
  data() {
    return sendInitial();
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
  watch: {
    open: function (newopen, oldopen) {
      if(newopen === true && oldopen === false) {
        this.amount = ''
        this.destination = ''
      }
    }
  },
  mounted () {
    if ("NDEFReader" in window) {
      this.nfcsup = true
    }
  },
  methods: {
    scanDone: function (data) {
      this.amount = ''
      this.destination = ''
      this.formurl = ''
      if (data.startsWith(this.formsource)) {
        this.formurl = data
        this.renderform()
        return true
      }
      const qrdata = data.replace('nano:','').split('?')
      this.destination = qrdata[0]
      if (qrdata[1]) {
        qrdata[1].split('&').forEach(function(part) {
          const item = part.split('=')
          if (item[0] == 'amount' && item[1]) {
            let nanoamount = NanoCurrency.convert(item[1],this.rawconv)
            // make sure it's a valid number
            if (this.checkamount(item[1])) {
              this.amount = nanoamount
            }
          }
        }, this)
      }
    },
    async send() {
      this.payload = {}
      this.payloadhash = ''
      if(this.pow === null) {
        this.$notify({
          title: 'PoW not complete',
          text: 'Please wait for the status to be ready',
          type: 'error'
        })
      }
      if (this.checkout == true) {
        const inputs = document.getElementsByClassName("checkout")
        for (let input of inputs) {
          if (!input.value && input.required) {
            this.inputrequired(this)
            return false
          } else if (input.dataset.regexp && input.dataset.error) {
            let re = new RegExp(input.dataset.regexp)
            if (!re.test(input.value)) {
              this.$notify({
                title: 'Error',
                text: input.dataset.error,
                type: 'error'
              })
              return false
            }
          }
          this.payload[input.name] = btoa(input.value)
        }
      }
      if (this.amount.startsWith('.')){
        this.amount = '0' + this.amount
      }
      const amount = NanoCurrency.convert(this.amount, this.nanoconv)
      // make sure it's a valid number
      if (this.checkamount(amount) && NanoCurrency.checkAddress(this.destination)) {
        const senderpublickey = NanoCurrency.derivePublicKey(this.privatekey)
        const sender = NanoCurrency.deriveAddress(senderpublickey,{useNanoPrefix:true})
        let info = {}
        info['action'] = 'account_info'
        info['representative'] = 'true'
        info['account'] = sender
        const res = await this.$store.dispatch('app/rpCall', info)
        const balance = new BigNumber(res.balance).minus(new BigNumber(amount)).toFixed()
        const block = NanoCurrency.createBlock(this.privatekey, {
          work: this.pow,
          previous: res.frontier,
          representative: res.representative,
          balance: balance,
          link: this.destination
        })
        console.log(block)
        let send = {}
        send['action'] = 'process'
        send['json_block'] = 'true'
        send['subtype'] = 'send'
        send['block'] = block.block
        const sendres = await this.$store.dispatch('app/rpCall', send)
        if (Object.keys(this.payload).length !== 0) {
          this.payload['transactionhash'] = sendres.hash
          this.payload['net'] = this.net
          this.payload['formurl'] = this.formurl
          const payloadstring = JSON.stringify(this.payload)
          this.payloadhash = await this.sum(Buffer.from(payloadstring, 'utf8'))
          const { response, apires } = await this.setmetadata(this.payloadhash,sendres.hash,this.$store.state.app.privatekey,this.net)
          if (response.ok) {
            this.$notify({
              title: 'Transaction signed',
              text: 'Transaction has been signed at nanometadata.com',
              type: 'success'
            })
            console.log(payloadstring)
          } else {
            this.$notify({
              title: 'Cannot sign transaction',
              text: apires,
              type: 'error'
            })
          }
          var Init = { method:'POST',body: payloadstring}
          var orderes = await fetch(this.checkoutapi + '?trans=' + sendres.hash,Init)
          var orderdata = await orderes.json()
          const filename = orderdata.message + '.txt'
          var blob = new Blob([payloadstring], {type: 'text/plain'});
          if(window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveBlob(blob, filename);
          }
          else{
            var elem = window.document.createElement('a');
            elem.href = window.URL.createObjectURL(blob);
            elem.download = filename;        
            document.body.appendChild(elem);
            elem.click();        
            document.body.removeChild(elem);
          }
        }
        this.$store.commit('app/pow', null)
        Object.assign(this.$data, sendInitial())
        this.$emit('close', 'true')
      } else if (!NanoCurrency.checkAddress(this.destination)) {
        this.$notify({
          title: 'Destination address is not valid',
          text: 'Please use a valid address',
          type: 'error'
        })
      }
    },
    setmax () {
      this.amount = this.$store.state.app.balance
    },
    async renderform() {
      if (this.$store.state.app.node.address.split('.').slice(-2)[0] == 'linuxserver') {
        this.net = 'lsio'
      } else {
        this.net = 'live'
      }
      if (this.formurl.startsWith(this.formsource)) {
        const formres = await fetch(this.formurl)
        const formyaml = await formres.text()
        const checkout = yaml.load(formyaml)
        if (checkout.net !== this.net) {
          this.$notify({
            title: 'Error',
            text: 'Checkout is not for this Network',
            type: 'error'
          })
          return false
        }
        this.checkout = true
        this.sendtab = false
        this.product = checkout.product
        this.amount = checkout.price.toString()
        this.destination = checkout.destination
        this.checkoutheader = 'This will send ' + checkout.price + ' Nano to ' + checkout.destination.substring(0, 11) + '...' + checkout.destination.slice(checkout.destination.length - 6) + ' for ' + checkout.product + ' ,please save your receipt from this order it will help you verify your order if something goes wrong'
        for (let input of checkout.inputs) {
          if (input.type == 'email') {
            this.emailform = true
            this.emailattrs = {placeholder: input.placeholder,required: input.required}
          }
          if (input.type == 'address') {
            this.addressform = true
            this.addressattrs = {required: input.required}
          }
          if (input.type == 'name') {
            this.nameform = true
            this.nameattrs = {placeholder: input.placeholder,required: input.required}
          }
          if (input.custom) {
            this.customform = true
            for (let custom of input.custom) {
              this.custominputs.push(custom) 
            }
          }
        }
      } else {
        this.$notify({
          title: 'Error',
          text: 'Invalid Checkout Source',
          type: 'error'
        })
      }
    },
    inputrequired (that) {
      that.$notify({
        title: 'Error',
        text: 'Input Required',
        type: 'error'
      })
    },
    setSend () {
      this.amount = ''
      this.destination = ''
      this.sendtab = true
      this.checkout = false
      this.customform = false
      this.custominputs = []
    },
    setCheckout () {
      this.formurl = ''
      this.sendtab = false
    }
  }
}
</script>
<!--<style lang="scss" scoped>
#canvas {
  -webkit-transform: scaleX(-1);
  transform: scaleX(-1);
}
</style>-->
