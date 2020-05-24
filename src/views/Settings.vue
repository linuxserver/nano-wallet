<template>
  <div class="settings">
    <div class="details">
        <label for="representative">Current Representative</label>
        <a href="#" class="copy" @click="copyToClipboard(representative)"><i class="fad fa-clone"></i></a>
        <input class="copytext" type="text" name="representative" :value="representative" />
    </div>
    <div class="details">
        <label for="newrep">Change Representative</label>
        <a href="#" class="copy" @click="copyToClipboard(newrep)"><i class="fad fa-clone"></i></a>
        <input class="newrep" type="text" v-model="newrep" name="newrep" />
    </div>
    <button class="repchange btn">Change Representative</button>
  </div>
</template>

<script>

export default {
  name: 'Settings',
  props: {
    representative: String
  },
  data() {
    return {
      newrep: ''
    }
  }

}
</script>