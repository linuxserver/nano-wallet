<template>
  <div class="scan-nfc-code">
    <button class="scan btn outline" @click="scanNfc" type="button">Scan NFC</button>
    <div class="page" style="z-index: 9;" :class="{active: scannfc !== false}">
      <a class="close" @click="closeScan"><i class="fal fa-times"></i></a>
      <div v-if="output === 'Scanning'">{{ output }} <i class="fas fa-spinner fa-spin"></i></div>
      <div v-else>{{ output }}</div>
    </div>
  </div>
</template>

<script>

export default {
  /* global NDEFReader */
  name: 'ScanNfc',
  props: {
  },
  data() {
    return {
      output: 'Checking for Web NFC Support',
      scannfc: false,
      reader: null
    }
  },
  methods: {
    closeScan () {
      this.scannfc = false
      if (this.reader !== null){
        this.reader.stop()
      }
    },
    async scanNfc () {
      this.scannfc = true
      const that = this
      try {
        that.reader = new NDEFReader();
        await that.reader.scan();
        that.output = 'Scanning'
        that.reader.addEventListener("error", (event) => {
          that.output = event.message
        })
        that.reader.onreading = event => {
          const message = event.message;
          for (const record of message.records) {
            switch (record.recordType) {
              case "text": {
                const decoder = new TextDecoder(record.encoding)
                const text = decoder.decode(record.data)
                that.$emit('scanned', text)
                that.closeScan()
                break
              }
              default: {
                that.output = 'only text NDEF records are supported for scanning'
              }
            }
          }
        }
      } catch (error) {
        that.output = error
      }
    }

  }
}
</script>

