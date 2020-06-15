<template>
  <div style="top: 0;" id="blockdetails" class="page active">
    <label for="key">Enter node address</label>
    <input v-model="node" type="text" id="node" name="node">
    <button @click="openNode" class="openwallet btn" type="button">Go To Node</button>
    <p style="margin-top: 40px;">This wallet is designed to use any Nano Node RPC server as a backend, using nano.linuxserver.io will plug you into our own public network.</p><p>If you are looking for the live Nano network please use <a class="highlight" href="https://tixwallet.cc/" target="_blank">tixwallet.cc</a>.</p><p>More information including how to get funds from a faucet is available on <a class="highlight" target="_blank" href="https://github.com/linuxserver/nano-wallet/">GitHub</a>.</p>
    <p><a class="highlight" target="_blank" href="https://github.com/linuxserver/nano-wallet/"><i class="fab fa-2x fa-github"></i></a></p>
  </div>
</template>

<script>

export default {
  name: 'Block',
  components: {
  },
  data() {
    return {
      node: 'nano.linuxserver.io'
    }
  },
  watch: {
  },
  methods: {
    openNode () {
      this.$router.push('/' + this.node)
    }
  }
}
</script>

<style lang="scss">
</style>