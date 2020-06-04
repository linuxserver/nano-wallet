<template>
  <div class="scan-qr-code">
    <button class="scan btn outline" @click="scanQR" type="button">Scan QR</button>
    <div class="page" style="z-index: 9;" :class="{active: scan !== false}">
      <a class="close" @click="closeScan"><i class="fal fa-times"></i></a>
      <div v-if="loadingMsg">{{ loadingMsg }}</div>
      <canvas :id="'scan_' + _uid"></canvas>
    </div>
  </div>
</template>

<script>
import jsQR from 'jsqr'

var video = document.createElement("video")

export default {
  name: 'ScanQr',
  props: {
  },
  data() {
    return {
      amount: '',
      destination: '',
      scan: false,
      scanner: null,
      canvas: null,
      stream: null,
      continue: true,
      loadingMsg: 'Unable to access video stream (please make sure you have a webcam enabled)',
    }
  },

  methods: {
    closeScan () {
      if (video.srcObject){
        video.srcObject.getTracks().forEach(function(track) {
          track.stop()
        })
      }
      this.scan = false
      this.continue = false

    },
    async scanQR () {
      this.scan = true
      this.continue = true

      var canvasElement = document.getElementById('scan_' + this._uid)
      this.canvas = canvasElement.getContext("2d")

      const that = this

      function drawLine(begin, end, color) {
        that.canvas.beginPath();
        that.canvas.moveTo(begin.x, begin.y);
        that.canvas.lineTo(end.x, end.y);
        that.canvas.lineWidth = 4;
        that.canvas.strokeStyle = color;
        that.canvas.stroke();
      }

      // Use facingMode: environment to attemt to get the back camera on phones
      navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(function(stream) {
        video.srcObject = stream
        video.setAttribute("playsinline", true) // required to tell iOS safari we don't want fullscreen
        video.play()
        requestAnimationFrame(tick)
      })

      function tick() {
        that.loadingMsg = "Loading video..."
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          that.loadingMsg = null

          canvasElement.height = video.videoHeight
          canvasElement.width = video.videoWidth
          that.canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height)
          var imageData = that.canvas.getImageData(0, 0, canvasElement.width, canvasElement.height)
          var code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          })
          if (code) {
            drawLine(code.location.topLeftCorner, code.location.topRightCorner, "#0cd21a")
            drawLine(code.location.topRightCorner, code.location.bottomRightCorner, "#0cd21a")
            drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, "#0cd21a")
            drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, "#0cd21a")
            // console.log(code.data.replace('nano:',''))
            that.$emit('scanned', code.data)
            video.srcObject.getTracks().forEach(function(track) {
              track.stop()
            })

            that.continue = false
            setTimeout(function(){ 
              that.scan = false
            }, 1200);
          }
        }
        if(that.continue === true) {
          requestAnimationFrame(tick)
        }
      }

    }

  }
}
</script>

