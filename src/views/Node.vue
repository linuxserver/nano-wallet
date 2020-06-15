<template>
  <div style="top: 0;" id="blockdetails" class="page active">
    <label for="key">Enter node address</label>
    <input v-model="node" type="text" id="node" name="node">
    <button @click="openNode" class="openwallet btn" type="button">Go To Node</button>
    <p>A blurb about what this is</p>
    <p><a class="highlight" href="https://github.com/linuxserver/nano-wallet/">Github</a></p>
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