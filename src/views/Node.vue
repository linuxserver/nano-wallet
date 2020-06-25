<template>
  <div style="top: 0;" id="blockdetails" class="page active">
    <div id="inputs">
      <div class="labeltabs">
        <label @click="setNormal" class="df" :class="{ active: showadvanced !== true}">
          Enter Node Address
        </label>
        <label @click="setAdvanced" class="df" :class="{ active: showadvanced === true}">
          Advanced
        </label>
      </div>
      <input v-show="showadvanced === false" v-model="node" type="text" id="node" name="node">
      <input v-show="showadvanced === true" v-model="address" placeholder="endpoint IE yourdomain.com" type="text" id="address" name="address">
      <input v-show="showadvanced === true" v-model="protocol" placeholder="http or https" type="text" id="protocol" name="protocol">
      <input v-show="showadvanced === true" v-model="port" placeholder="port to connect to IE 443" type="text" id="port" name="port">
      <input v-show="showadvanced === true" v-model="path" placeholder="Path IE /proxy *optional" type="text" id="path" name="path">
      <input v-show="showadvanced === true" v-model="auth" placeholder="Auth Header IE Basic TOKENHERE *optional" type="text" id="auth" name="auth">
      <button v-show="showadvanced === false" @click="openNode" class="openwallet btn" type="button">Go To Node</button>
      <button v-show="showadvanced === true" @click="openAdvanced" class="openwallet btn" type="button">Go To Node</button>
    </div>
    <p style="margin-top: 40px;">This wallet is designed to use any Nano Node RPC server as a backend, using nano.linuxserver.io will plug you into our own public network. More information including how to get funds from a faucet is available on <a class="highlight" target="_blank" href="https://github.com/linuxserver/nano-wallet/">GitHub</a>.</p><p>If you are looking for the live Nano network please use <a class="highlight" href="https://tixwallet.cc/" target="_blank">tixwallet.cc</a>.</p>
    <p><a class="highlight" target="_blank" href="https://github.com/linuxserver/nano-wallet/"><i class="fab fa-2x fa-github"></i></a></p>
  </div>
</template>

<script>
import { serverMixin } from '../mixins/serverMixin.js'

export default {
  name: 'Node',
  components: {
  },
  data() {
    return {
      node: 'nano.linuxserver.io',
      address: '',
      protocol: '',
      port: '',
      path: '',
      auth: '',
      showadvanced: false
    }
  },
  mixins: [ serverMixin ],
  methods: {
    openNode () {
      this.$router.push('/' + this.node)
    },
    openAdvanced () {
      if (this.address && (this.protocol == 'http' || this.protocol == 'https') && this.port) {
        this.$store.state.app.settings.changeaddress = false
        this.$store.state.app.settings.checkbackends = false
        this.$store.state.app.settings.followlinks = false
        let node = {}
        node['headers'] = {'Content-Type': 'application/json'}
        node['address'] = this.address
        node['protocol'] = this.protocol
        node['port'] = this.port
        if (this.path) {
          node['path'] = this.path
        }
        if (this.auth) {
          node['auth'] = this.auth
        }
        this.$store.state.app.settings.node = [node]
        this.$router.push({name:'Home'})
      } else {
        this.$notify({
          title: 'Error',
          text: 'Please fill out all required values',
          type: 'error'
        })
      }
    },
    setAdvanced () {
      this.showadvanced = true
    },
    setNormal () {
      this.showadvanced = false
    }
  }
}
</script>

<style lang="scss">
</style>
