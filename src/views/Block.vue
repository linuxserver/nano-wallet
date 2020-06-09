<template>
  <div style="top: 0;" id="blockdetails" class="page active">
    <block-state :details="blockdetails"></block-state>
  </div>
</template>

<script>
import BlockState from '@/components/BlockState.vue'

export default {
  name: 'Block',
  components: {
    BlockState
  },
  data() {
    return {
      blockdetails: null
    }
  },
  computed: {
    node: function () {
      return this.$store.state.app.node
    }
  },
  watch: {
    node: function (newnode) {
      if(newnode.address !== null) {
        this.blockdetails = this.$route.params.hash
      }
    }
  },
  mounted() {
    // this.blockdetails = this.$route.params.hash
  }
}
</script>

<style lang="scss">
</style>