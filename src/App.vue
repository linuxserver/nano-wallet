<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App',
  components: {
    // HelloWorld
  },
  data() {
    return {
      key: null
    }
  },
  watch: {
    $route() {
      this.$store.dispatch('app/node')
    }
  },
  created () {
    this.$store.dispatch('app/node')
  }
}
</script>


<style lang="scss">
// Fonts
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@200;400;700&display=swap');

// Body
$body-bg1: #4d5879;
$body-bg2: #26314e;

// Typography
$font-family-sans-serif: "Nunito", sans-serif;
$font-size-base: 16px;
$line-height-base: 1.6;

// Colors
$active: #0075c2;
$text: #a7b0ca;
$lighter-text: #959da0;

//$highlight: #2cc2ca;
$highlight: #59c7f1;
$highlightsemi: #59c7f1bb;
$highlight2: #af73d2;
$highlight3: #e2ac39;

html, body {
    background: linear-gradient(to bottom, $body-bg1, $body-bg2);
    color: $text;
    font-family: 'Nunito', sans-serif;
    font-weight: 700;
    font-size: $font-size-base;
    height: 100%;
    margin: 0;
}
pre {
    overflow-x: auto;
    font-size: 14px;
}
* {
    box-sizing: border-box;
}
.rotate{
  svg {
    transition: all 2s linear;
  }
  &.down{
    svg {
      transform: rotate(360deg);
    }
  }
}
.refresh {
}
.df {
    display: flex;
}
.error {
  background: #ca4b4b;
  margin: 0 0 30px;
  padding: 10px;
  text-align: center;
  color: white;
  font-weight: 200;
}
.close {
    position: absolute;
    top: 20px;
    right: 20px;
    color: $highlight;
    font-size: 24px;
    z-index: 2;
}
.morebutton {
    color: #ccc;
    font-size: 14px;
    margin-right: 10px;
}
canvas {
    display: inline-block!important;
    max-width: 100%;
    height: auto!important;
}

#powstatus {
    width: 100%;
    position: relative;
    height:32px;
    overflow: hidden;
    position: absolute;
    z-index: 5;
    .status {
        padding: 5px;
        position: absolute;
        transition: 0.7s all;
        text-align: center;
        left: 0;
        right: 0;
        height: 32px;
        text-shadow: 0 0 6px #00000045;
        svg {
            filter: drop-shadow(0 0 6px #00000045);
        }
        &.busy {
            background: #363e58;
            top: -32px;
            &.active {
                top: 0;
            }
        }
        &.ready {
            background: $highlight;
            color: white;
            top: 32px;
            &.active {
                top: 0;
            }
        }
    }
}
.showmobile {
  display: block!important;
  @media all and (min-width: 900px) {
    display: none!important;
  }
}
.hidemobile {
  display: none!important;
  @media all and (min-width: 900px) {
    display: block!important;
  }
}
#app {
    width: 100vw;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
    .page {
        background: $body-bg2;
        background-image: url('../public/app-overlay.png');
        background-image: url('../public/app-overlay.png'), linear-gradient(to bottom, $body-bg1, $body-bg2);
        background-size: contain;
        width: 100vw;
        height: 100%;
        padding: 30px;    
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        transition: all 0.3s;
        position: absolute;
        top: 32px;
        left: 100vw;
        &.active {
            left: 0;
            z-index: 2;
        } 
        .inner {
            overflow-y: auto;
            padding-bottom: 65px;
            position: relative;
            width: calc(100% + 60px);
            padding: 30px;
            padding-top: 62px;
            margin: -30px;
            @media all and (min-width: 900px) {
                display: flex;
                justify-content: center;
                overflow-y: visible;
                &.settings {
                    .block {
                        max-width: 500px;
                    }
                }
                .block {
                    flex: 1;
                    padding: 10px 30px;                    
                    .details {
                        margin-bottom: 15px;
                        input {
                            margin-bottom: 22px;
                        }
                    }
                    &.history {
                      height: calc(100vh - 75px);
                      padding-bottom: 75px;
                      overflow: auto;
                    }
                    &.pending {
                      height: calc(100vh - 120px);
                      padding-bottom: 75px;
                      overflow: auto;
                    }
                    canvas {
                        // max-width: 300px;
                    }
                }
            }
        }
    }
    #login {
        justify-content: space-between;
        top: 0;
    }
    
    #send, #receive, #settings {
        z-index: 2;
    }
    #receive {
        .qrcode {
            text-align: center;
            img {
                display: inline-block!important;
                max-width: 100%;
                height: auto;
            }
        }
        .block {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .btn {
            margin-top: 30px;
            width: 100%;
        }
        .address {
            font-size: 18px;
            margin: 0 30px 30px;
            font-weight: bold;
            line-height: 1.8;
        }
    }
    #scan, #blockdetails {
        z-index: 3;
    }
    #scan {
        top: 0;
    }
    #settingsdetails {
        width: 100%;
    }
    #genwallet {
        top: 0;
        justify-content: flex-start;
    }
    .genwallet {
        color:$text;
        font-size: 14px;
        font-weight: 400;
    }
    #wallet {
        z-index: 1;
        justify-content: flex-start;
        padding: 0;
        top: 0;
        .menu {
            position: absolute;
            bottom:0;
            height: 75px;
            left: 0;
            width: 100%;
            .bg {
                position: absolute;
                bottom:0;
                top: 0;
                left: 0;
                right: 0;
                background: #1f263cad;
                backdrop-filter: blur(10px);
            }
            .tab {
                cursor: pointer;
                flex: 1;
                height: 100%;
                justify-content: center;
                align-items: center;
                display: flex;
                flex-direction: column;
                font-weight: 400;
                font-size: 14px;
                .menuicon {
                    margin-bottom: 4px;
                }
            }
            .content {
                position: absolute;
                bottom:0;
                top: 0;
                left: 0;
                right: 0;
                display: flex;
                justify-content: space-evenly;
                align-items: center;
                a {
                    color: white;
                    text-decoration: none;
                }
            }
        }
    }
    .scan-qr-code {
      .page {
        position: fixed;
      }
    }
}
#output {
    .balance {
        background: #3e4761;
        margin: 10px 10px 40px;
        padding: 20px 40px;
        border-radius: 10px;
        word-break: break-all;
        text-align: center;
        border: 1px solid #ffffff12;
        box-shadow: 0 0 11px #00000038;
        position: relative;
        .balanceextra {
            position: absolute;
            bottom: 8px;
            right: 8px;
            padding: 0 10px;
            color: $text;
            font-size: 12px;
        }
        .value {
            font-size: 44px;
            color: #d1d5e2;
            font-weight: bold;
            margin: 30px 0;
            line-height: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            img {
                display: inline-block;
                width: 40px;
                margin-right: 10px;
            }
            .suffix {
                font-size: 30px;
                color: #bec3d2c9;
                margin-left: 6px;
            }
        }
        .raw {
            font-size: 12px;
            line-height: 1;
            display: flex;
            justify-content: center;
            display: none;
            letter-spacing: 2px;
            font-weight: 200;
            &.active {
                display: flex;
            }
            img {
                width: 12px;
                margin-right:4px;
            }
        }
    }
}

.headingtitle {
    font-size: 16px;
    font-weight: 400;
    margin: 40px 25px 5px;
    display: flex;
    justify-content: space-between;
    text-transform: uppercase;
    letter-spacing: 4px;
    &.top {
        margin: 25px 20px 25px;               
    }
}

.address {
    word-break: break-all;
    font-size: 16px;
    font-weight: 200;
    .highlight {
        font-weight: 700;
    }
}
#breakdown {
    justify-content: flex-start;
    height: calc(100% - 30px);
    overflow: auto;
    font-weight: 200;
    word-break: break-all;
    width: 100%;
    header {
        font-size: 24px;
        justify-content: flex-start;
        margin: 0;
    }
    .title {
        font-weight: 400;
        font-size: 18px;
        display: flex;
        align-items: baseline;
        text-transform: uppercase;
        letter-spacing: 2px;
    }
    .label {
        opacity: 0.7;
        font-size: 14px;
        margin-top: 5px;
        word-break: break-word;
    }
    .json {
        overflow: auto;
    }
    .block {
        margin-bottom: 20px;
    }
    .stateblock {
        word-break: break-all;
    }
    .value {
        word-break: break-all;
        font-weight: 200;
        font-size: 16px;
        margin-left: 25px;
        letter-spacing: 0;
        text-transform: none;
        &.mla {
            margin-left: auto;
        }
    }
    .hide {
        position: absolute;
        left: -999em;
    }
    .address {
        position: absolute;
        top: 30px;
        left: 0;
        font-weight: 400;
    }
    .date {
        font-weight: 400;
        margin-bottom: 30px;
    }
    details.uaddress {
        height: 100px;
    }
    .raw {
        font-size: 12px;
    }
}

.mla {
    margin-left: auto;
}
.sendfunds {
    width: 100%;
    margin: 15px 0 30px;
}
.scan {
    width: 100%;
}
.highlight {
    color: $highlight;
}
#history, #pendingblocks {
    width: 100%;
    padding: 0 10px;
}
.transaction {
    display: flex;
    align-items: center;
    padding: 20px;
    position: relative;
    border-bottom: 1px solid rgba(255,255,255, 0.05);
    &:after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        border-bottom: 1px solid #00000052;
    }
    .innerdetails {
        flex: 1;
    }
    .address {
        font-weight: 200;
        font-size: 12px;
        opacity: 0.7;
    }
    .icon {
        font-size: 35px;
        margin-right: 15px;
        opacity: 0.85;
        display: block;
    }
    .value {
        display: flex;
        align-items: center;
        line-height: 1;
        font-size: 14px;
        svg {
            margin-left: 5px;
        }
    }
    .amount {
        display: flex;
        align-items: center;
        justify-content: space-between;
        .icon {
            margin-left: 5px;
        }
        .type {
            color: white;
            font-size: 14px;
        }
    }
    button.pocket {
        background: $highlight3;
        border: none;
        padding: 3px 20px;
        border-radius: 7px;
    }
    &.receive {
        .type {
            color: $highlight;
        }
    }
    &.send {
        .type {
            color: $highlight2;
        }
    }
    &.pending {
        .type {
            color: $highlight3;
        }
    }
}
#output {
    width: 100%;
    .details {
        padding: 0 40px;
    }
}
label {
    margin-bottom: 10px;
    display: inline-block;
}
input[type=text], input[type=password] {
    font-size: 22px;
    padding: 15px;
    background: #00000036;
    color: $text;
    border-radius: 5px;
    border: 2px solid $highlight;
    margin-bottom: 30px;
    width: 100%;
    &.copytext {
    }
    @media all and (min-width: 900px) {
        font-size: 15px;
        padding: 12px;
    }

}
.login {
    position: relative;
    .eye {
        position: absolute;
        display: flex;
        right: 0;
        top: 0;
        height: 60px;
        width: 60px;
        justify-content: center;
        align-items: center;
        font-size: 24px;
        span {
            display: none;
            &.active {
                display: block;
            }
        }

    }
    input[type=text], input[type=password] {
        padding-right: 60px;
        @media all and (min-width: 900px) {
            font-size: 22px;
            padding: 15px 60px 15px 15px;
        }

    }

}

.details {
    position: relative;
    margin-bottom: 30px;
    border-bottom: 1px solid #ffffff21;
    position: relative;
    &:after {
        position: absolute;
        content: "";
        border-bottom: 1px solid #00000036;
        bottom: 0;
        left: 0;
        right: 0;
    }
    label {
        display: block;
    }
    input {
        /* background: #00000014;
        padding: 6px;
        font-size: 16px;
        width: 100%;
        border: none; */
    }
    .copy {
        position: absolute;
        right: 0px;
        top: 0px;
        color: $highlight;
        text-decoration: underline;
    }
    &.smaller {
        margin-bottom: 0;
        border-bottom: none;
        &:after {
            display: none;
        }
    }
}
.rpc {
    margin: -30px 0;
    width: calc(100% + 60px);
    position: relative;
    text-align: center;
    font-weight: 400;
    padding: 10px;
    background: #00000026;
    font-size: 12px;
    letter-spacing: 2px;
    text-transform: lowercase;
    span {
        color: $highlight;
        letter-spacing: 0;
        text-transform: none;
        margin-left: 10px;
    }
}
#inputs {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 500px;
    padding-top: 50px;
    label {
        font-size: 16px;
        font-weight: 400;
        text-transform: uppercase;
        letter-spacing: 4px;
    }
    button {
        padding: 15px;
        margin-bottom: 15px;
    }
}
.btn {
    background: $highlight;
    border-radius: 20px;
    border: none;
    color: $body-bg2;
    cursor: pointer;
    padding: 10px 20px;
    font-size: 16px;
    display: inline-block;
    justify-content: center;
    letter-spacing: 3px;
    text-align: center;

    &.outline {
        padding: 8px 18px;
        border: 2px solid $highlightsemi;
        background: transparent;
        color: $highlightsemi;
        &:hover {
            border-color: $highlight;
            color: $highlight;
        }
    }
}
.inline-buttons {
    display: flex;
    .btn {
        flex: 1;
    }
}
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
    transition: background-color 5000s ease-in-out 0s;
    -webkit-text-fill-color: $text !important;
}
#buttons {
    button {
        background: none;
        color: #ccc;
        border: none;
        font-size: 14px;
    }
}
</style>
