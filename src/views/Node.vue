<template>
  <div style="top: 0;" id="blockdetails" class="page active">
    <label for="key">Enter node address</label>
    <input v-model="node" type="text" id="node" name="node">
    <button @click="openNode" class="openwallet btn" type="button">Go To Node</button>
  </div>
</template>

<script>

export default {
  name: 'Block',
  components: {
  },
  data() {
    this.$router.push('/tx')
    return {
      node: ''
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