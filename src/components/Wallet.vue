<template>
  <div class="wallet">
    <button class="btn outline" @click="createWallet" type="button">Paper Wallet</button>
    <div class="page" style="z-index: 9; justtify-content: flex-start;" :class="{active: wallet !== false}">
      <div class="inner">
      <a class="close" @click="closeWallet"><i class="fal fa-times"></i></a>
      <canvas width="2480" height="1508" style="background: white; max-height: 360px; height: auto;" :id="'wallet_' + _uid"></canvas>
      <div id="private"></div>
      <div id="public"></div>
      <button @click="printWallet">Print</button>
    </div>
    </div>
  </div>
</template>

<script>
import QRCodeStyling from 'qr-code-styling'

export default {
  name: 'Wallet',
  props: {
    private: String,
    public: String
  },
  data() {
    return {
      wallet: false,
    }
  },

  methods: {
    closeWallet () {
      this.wallet = false

    },
    async createWallet () {
      this.wallet = true
      const canvasElement = document.getElementById('wallet_' + this._uid)
      const canvas = canvasElement.getContext("2d")

      canvas.width = 2480
      canvas.height = 1508

      const base_image = new Image()
      base_image.src = '/wallet.png'
      base_image.onload = function(){
        canvas.drawImage(base_image, 0, 0);
      }

      const sectionwidth = 828
      const sectionheight = 585

      const that = this

      const qrCode = new QRCodeStyling({
        width: 512,
        height: 512,
        data: that.private,
        image: 'qr_logo.png',
        dotsOptions: {
          type: 'rounded'
        },
        imageOptions: {
          hideBackgroundDots: false
        },
        qrOptions: {
          //errorCorrectionLevel: 'H'
        }
      })
      // qrCode.append(document.getElementById('private'));

      console.log(qrCode._canvas)
      console.log(qrCode._canvas.getCanvas())
      const privateSrc = qrCode._canvas.getCanvas()
      const privateQr = new Image()
      privateQr.onload = function () {
        canvas.drawImage(privateQr, sectionwidth, 0);
        canvas.strokeRect(sectionwidth, 0, privateQr.width, privateQr.height);
      }
      // console.log(document.getElementById('private').firstElementChild.toDataURL())
      // privateQr.src = document.getElementById('private').firstElementChild.toDataURL()

      console.log(privateSrc)

      const logo_image = new Image()
      logo_image.onload = function(){
        let x = (sectionwidth - logo_image.width) / 2
        let y = (sectionheight - logo_image.height) / 2

        canvas.drawImage(logo_image, x, sectionheight + y);
      }
      logo_image.src = '/wallet_logo.png'


    },
    async printWallet () {
      console.log('print')
    }

  }
}
</script>

