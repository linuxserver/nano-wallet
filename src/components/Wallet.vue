<template>
  <div class="wallet">
    <button style="width: 100%;" class="btn outline" @click="createWallet" type="button">Paper Wallet</button>
    <div class="page" style="z-index: 9; top: 0; bottom: 0; justtify-content: flex-start;" :class="{active: wallet !== false}">
      <div class="fdcol">
      <a class="close" @click="closeWallet"><i class="fal fa-times"></i></a>
      <div class="printpos">
        <canvas width="2480" height="3508" style="" :id="'wallet_' + _uid"></canvas>
        <div class="posbuttons">
          <div class="print-position">A4 Print position</div>
          <button class="btn" :class="{ outline: position !== 1}" @click="position = 1"><img src="wallet_preview.png" /></button>
          <button class="btn" :class="{ outline: position !== 2}" @click="position = 2"><img src="wallet_preview.png" /></button>
          <button class="btn" :class="{ outline: position !== 3}" @click="position = 3"><img src="wallet_preview.png" /></button>
        </div>
      </div>
      <button style="width: 100%; margin-top: 20px;" class="btn" @click="printWallet">Print</button>
    </div>
    </div>
  </div>
</template>

<script>
// import QRCodeStyling from 'qr-code-styling'
import QRCode from 'qrcode'

export default {
  name: 'Wallet',
  props: {
    private: String,
    public: String
  },
  data() {
    return {
      wallet: false,
      position: 1,
      src: null,
      loaded: 0,
      canvas: null
    }
  },
  watch: {
    position: function (newpos, oldpos) {
      if (newpos !== oldpos) {
        this.loaded = 0
        this.createWallet()
      }
    },
    loaded: function (newpos) {
      if (newpos === 4) {
        this.src = this.canvas.toDataURL("image/png")
      }
    }
  },
  computed: {
    startTop () {
      if (this.position === 1) return parseInt(0)
      return parseInt((this.position - 1) * 1169)
    }
  },
  methods: {
    closeWallet () {
      this.wallet = false

    },
    async createWallet () {
      this.wallet = true
      this.canvas = document.getElementById('wallet_' + this._uid)
      const ctx = this.canvas.getContext("2d")

      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      ctx.width = 2480
      ctx.height = 3508

      const sectionwidth = 827
      const sectionheight = 585

      const that = this

      // Base layer
      function drawDashedLine(x1, y1, x2, y2) {
        ctx.beginPath()
        ctx.setLineDash([10,10])
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }

      drawDashedLine(0, this.startTop + 0, ctx.width, this.startTop + 0)
      drawDashedLine(0, this.startTop + 585, ctx.width, this.startTop + 585)
      drawDashedLine(0, this.startTop + 1169, ctx.width, this.startTop + 1169)

      drawDashedLine(820, this.startTop + 0, 820, this.startTop + 1169)
      drawDashedLine(1661, this.startTop + 0, 1661, this.startTop + 1169)

      ctx.font = "24px Nunito"
      ctx.fillStyle='#000000'
      ctx.fillText('To deposit funds to this paper,', sectionwidth + 40, this.startTop + sectionheight + 100)
      ctx.fillText('wallet, send nano to the public', sectionwidth + 40, this.startTop + sectionheight + 130)
      ctx.fillText('address on the right', sectionwidth + 40, this.startTop + sectionheight + 160)

      ctx.fillText('DO NOT REVEAL THE SEED', sectionwidth + 40, this.startTop + sectionheight + 220)
      ctx.fillText('until you are ready to import', sectionwidth + 40, this.startTop + sectionheight + 250)
      ctx.fillText('the balance to a nano wallet,', sectionwidth + 40, this.startTop + sectionheight + 280)
      ctx.fillText('exchange or online wallet.', sectionwidth + 40, this.startTop + sectionheight + 310)

      ctx.fillText('Amount: ', sectionwidth + 40, this.startTop + sectionheight + 390)
      ctx.fillText('Date:', sectionwidth + 40, this.startTop + sectionheight + 470)


      // End base layer

      const base_image = new Image()
      base_image.src = '/wallet.png'
      base_image.onload = function(){
        that.loaded += 1
        ctx.drawImage(base_image, 0, parseInt(that.startTop) + 0)
      }


      ctx.fillStyle='#000000'

      // qrCode.append(document.getElementById('private'));

      // Private
      ctx.save();
      ctx.translate(1240, 292);
      ctx.rotate(Math.PI);
      ctx.translate(-1240, -292);

      const privateSrc = await QRCode.toDataURL('nanoseed:' + this.private)

      ctx.font = "50px Nunito"
      ctx.fillText("S E E D", sectionwidth + 40, -this.startTop + 100)

      console.log(this.private)

      let text1 = this.private.substring(0, 8)
      let text2 = this.private.substring(8, 16)
      let text3 = this.private.substring(16, 24)
      let text4 = this.private.substring(24, 32)
      let text5 = this.private.substring(32, 40)
      let text6 = this.private.substring(40, 48)
      let text7 = this.private.substring(48, 56)
      let text8 = this.private.substring(56, 64)

      ctx.font = "38px Monospace"

      ctx.fillText(text1.split("").join(String.fromCharCode(8202)), sectionwidth + 40, -this.startTop + 160)
      ctx.fillText(text2.split("").join(String.fromCharCode(8202)), sectionwidth + 40, -this.startTop + 200)
      ctx.fillText(text3.split("").join(String.fromCharCode(8202)), sectionwidth + 40, -this.startTop + 240)
      ctx.fillText(text4.split("").join(String.fromCharCode(8202)), sectionwidth + 40, -this.startTop + 280)
      ctx.fillText(text5.split("").join(String.fromCharCode(8202)), sectionwidth + 40, -this.startTop + 320)
      ctx.fillText(text6.split("").join(String.fromCharCode(8202)), sectionwidth + 40, -this.startTop + 360)
      ctx.fillText(text7.split("").join(String.fromCharCode(8202)), sectionwidth + 40, -this.startTop + 400)
      ctx.fillText(text8.split("").join(String.fromCharCode(8202)), sectionwidth + 40, -this.startTop + 440)

      ctx.restore();

      const privateQr = new Image()
      privateQr.onload = function () {
        that.loaded += 1
        let y = (sectionheight - 400) / 2
      ctx.save();
      ctx.translate(1240, 292);
      ctx.rotate(Math.PI);
      ctx.translate(-1240, -292);

        ctx.drawImage(privateQr, sectionwidth + 400, -that.startTop + y, 400, 400)
        ctx.restore();
      }
      privateQr.src = privateSrc


      // End private

      // Address
      const publicSrc = await QRCode.toDataURL('nano:' + this.public)

      ctx.font = "50px Nunito"
      ctx.fillText("A D D R E S S", 40, this.startTop + sectionheight + 100)

      console.log(this.public)

      text1 = this.public.substring(0, 8)
      text2 = this.public.substring(8, 16)
      text3 = this.public.substring(16, 24)
      text4 = this.public.substring(24, 32)
      text5 = this.public.substring(32, 40)
      text6 = this.public.substring(40, 48)
      text7 = this.public.substring(48, 56)
      text8 = this.public.substring(56, 64)

      ctx.font = "38px Monospace"
      ctx.fillStyle='#d43789'
      ctx.fillText(text1.split("").join(String.fromCharCode(8202)), 40, this.startTop + sectionheight + 160)
      ctx.fillStyle='#000000'
      ctx.fillText(text2.split("").join(String.fromCharCode(8202)), 40, this.startTop + sectionheight + 200)
      ctx.fillText(text3.split("").join(String.fromCharCode(8202)), 40, this.startTop + sectionheight + 240)
      ctx.fillText(text4.split("").join(String.fromCharCode(8202)), 40, this.startTop + sectionheight + 280)
      ctx.fillText(text5.split("").join(String.fromCharCode(8202)), 40, this.startTop + sectionheight + 320)
      ctx.fillText(text6.split("").join(String.fromCharCode(8202)), 40, this.startTop + sectionheight + 360)
      ctx.fillText(text7.split("").join(String.fromCharCode(8202)), 40, this.startTop + sectionheight + 400)
      ctx.fillStyle='#d43789'
      ctx.fillText(text8.split("").join(String.fromCharCode(8202)), 40, this.startTop + sectionheight + 440)
      
      const publicQr = new Image()
      publicQr.onload = function () {
        that.loaded += 1
        let y = ((sectionheight - 400) / 2) + sectionheight
        ctx.drawImage(publicQr, 400, that.startTop + y, 400, 400)
        ctx.drawImage(publicQr, sectionwidth + 400, that.startTop + y, 400, 400)
      }
      publicQr.src = publicSrc

      // End Address



// console.log(document.getElementById('private').firstElementChild.toDataURL())
      // privateQr.src = document.getElementById('private').firstElementChild.toDataURL()

      console.log(privateSrc)

      const logo_image = new Image()
      logo_image.onload = function(){
        that.loaded += 1
        let x = (sectionwidth * 2) + (sectionwidth - logo_image.width) / 2
        let y = that.startTop + ((sectionheight - logo_image.height) / 2)

        ctx.drawImage(logo_image, x, sectionheight + y)
      }
      logo_image.src = '/wallet_logo.png'


    },
    async printWallet () {
      var win = window.open('about:blank', "_new");
    win.document.open();
    win.document.write([
        '<html>',
        '   <head>',
        '   </head>',
        '   <body style="margin: 0" onload="window.print()" onafterprint="window.close()">',
        '       <img style="width:100%" src="' + this.src + '"/>',
        '   </body>',
        '</html>'
    ].join(''));
    win.document.close();
    }

  }
}
</script>
<style lang="scss">
.print-position {
  margin-bottom: 8px;
}
.posbuttons {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  button {
    border-radius: 0;
    &.btn {
      padding: 0;
    }
    &.outline {
      img {
        opacity: 0.1;
      }
    }
  }
  img {
    width: 220px;
  }
}
.printpos {
  display: flex;
  canvas {
    background: white; 
    max-width: 500px; 
    height: auto;
    margin-right: 20px;
    border-radius: 20px;
    display: none!important;
  }
}
.fdcol {
  flex-direction: column;
}
@media print {
  .wallet {
    canvas {
      max-width: 100%!important;
    }
    .close {
      display: none;
    }
    > * {
      padding: 0;
      margin: 0;
    }
  }
}
</style>