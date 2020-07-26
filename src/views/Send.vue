<template>
  <div class="wrapper">
    <div class="content">
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
        <div v-for="(element) in form.inputs" :key="element.type">
          <div v-if="element.type === 'email'">
            <label for="email">Email:</label>
            <input data-regexp="^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$" data-error="Please Enter Valid Email" type="text" id="email" name="email" class="checkout" :Placeholder="element.placeholder" :required="element.required">
          </div>
          <div v-if="element.type === 'name'">
            <label for="name">Name:</label>
            <input type="text" id="name" name="name" class="checkout" :Placeholder="element.placeholder" :required="element.required">
          </div>
          <div v-if="element.type === 'address'">
            <label for="address1">Address:</label>
            <input type="text" id="address1" name="address1" class="checkout" placeholder="Street Address" :required="element.required">
            <label for="address2">Address 2:</label>
            <input type="text" id="address2" name="address2" class="checkout" placeholder="Apt or Box #" :required="false">
            <label for="country">Country:</label>
            <country-select v-model="country" id="country" name="country" :country="country" topCountry="US" class="checkout"/>
            <label for="region">Region:</label>
            <region-select v-model="region" id="region" name="region" :country="country" :region="region" class="checkout"/>
            <label for="city">City:</label>
            <input type="text" id="city" name="city" class="checkout" placeholder="Local City" :required="element.required">
            <label for="zip">Postal Code:</label>
            <input type="text" id="zip" name="zip" class="checkout" placeholder="Local Postal Code" :required="element.required">
          </div>
          <div v-if="element.type === 'custom'">
            <label :for="element.name">{{ element.label }}:</label>
            <input type="text" :id="element.name" :name="element.name" class="checkout" :placeholder="element.placeholder" :required="element.required">
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
        <div class="login">
        <input type="text" v-model="formurl" id="formurl" name="formurl">
        <span  @click="renderform" class="max">LOAD</span>
        </div>
      </div>
      <scan-qr v-if="checkout === false" @scanned="scanDone"></scan-qr>
      <scan-nfc v-if="nfcsup !== false && checkout === false" @scanned="scanDone"></scan-nfc>
      <button v-if="open === true && ((sendtab === true && checkout === false) || (sendtab === false && checkout === true))" class="sendfunds btn" @click="send" type="button"><span v-show="loading !== true">Send</span><span v-show="loading === true" class="icon"><i class="fa fa-spinner"></i></span></button>
    </div>
  </div>
</template>

<script>
import { serverMixin } from '../mixins/serverMixin.js'
import * as NanoCurrency from '@thelamer/nanocurrency'
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
    country: '',
    region: '',
    customform: false,
    form: {},
    payload: {},
    payloadhash: '',
    net: '',
    formsource: 'https://www.nanocheckout.com/templates/',
    formurl: '',
    sendtab: true,
    checkoutapi: 'https://api.nanocheckout.com/order',
    loading: false
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
    },
    prefixparams () {
      return this.$store.state.app.prefixparams
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
      this.loading = true
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
              this.loading = false
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
        let params = {}
        params[this.prefixparams] = true
        const sender = NanoCurrency.deriveAddress(senderpublickey,params)
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
        },params)
        console.log(block)
        let send = {}
        send['action'] = 'process'
        //send['json_block'] = 'true'
        send['subtype'] = 'send'
        send['block'] = JSON.stringify(block.block)
        console.log(send)
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
        this.loading = false
        return true
      } else if (!NanoCurrency.checkAddress(this.destination)) {
        this.$notify({
          title: 'Destination address is not valid',
          text: 'Please use a valid address',
          type: 'error'
        })
        this.loading = false
        return false
      }
    },
    setmax () {
      this.amount = this.$store.state.app.balance
    },
    async renderform() {
      if (this.$store.state.app.node.address.split('.').slice(-2)[0] == 'linuxserver') {
        this.net = 'lsio'
      } else if (this.prefixparams == 'useBananoPrefix') {
        this.net = 'banano'
      } else {
        this.net = 'live'
      }
      if (this.formurl.startsWith(this.formsource)) {
        const formres = await fetch(this.formurl)
        const formyaml = await formres.text()
        const checkoutyaml = yaml.load(formyaml)
        if (checkoutyaml.net !== this.net) {
          this.$notify({
            title: 'Error',
            text: 'Checkout is not for this Network',
            type: 'error'
          })
          return false
        }
        this.checkout = true
        this.sendtab = false
        this.product = checkoutyaml.product
        this.amount = checkoutyaml.price.toString()
        this.destination = checkoutyaml.destination
        this.checkoutheader = 'This will send ' + checkoutyaml.price + ' ' + ( this.net == 'banano' ? 'Banano' : 'Nano' ) + ' to ' + checkoutyaml.destination.substring(0, 11) + '...' + checkoutyaml.destination.slice(checkoutyaml.destination.length - 6) + ' for ' + checkoutyaml.product + ', please save your receipt from this order it will help you verify your order if something goes wrong'
        this.form = checkoutyaml
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
<style lang="scss">
.wrapper {
  display: table-cell;
  vertical-align: top;
  height: 100%;
  max-width: 800px;
  padding-bottom: 100px;
  @media all and (min-width: 1040px) {
    padding-bottom: 0;
  }
}
.content {
  max-height: 100%;
  overflow: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.content::-webkit-scrollbar {
  display: none;
}
@keyframes spinner {
  to { transform: rotate(360deg); }
}
.fa-spinner {
  animation: spinner 1s linear infinite;
}
</style>
