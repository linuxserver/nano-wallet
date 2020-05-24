<template>
  <div class="wallet">
    <div type="hidden" id="workstorage"></div>
      <div id="login" class="page active" :class="{ active: open===false }">
        <div class="title">&nbsp;</div>
        <div id="inputs">
          <div v-if="error !== null" class="error">{{ error }}</div>
          <label for="key">Private Key:</label>
          <div class="login">
            <input v-model="key" :type="logintype" id="key" name="key">
            <span class="eye" @click="togglevisibility">
              <span :class="{ active: logintype === 'password'}"><i class="far fa-eye"></i></span>
              <span :class="{ active: logintype === 'text'}"><i class="far fa-eye-slash"></i></span>
            </span>
          </div>
          
          <button @click="openWallet" class="openwallet btn" type="button">Open Wallet</button>
        </div>
        <div id="buttons">
          <router-link class="genwallet" :to="'/' + $route.params.node + '/generate'">Generate Wallet</router-link>
        </div>
      </div>
      <div id="wallet" class="page" :class="{active: open === true}">
        <div id="powstatus">
            <div class="status busy" :class="{active: ready === false}">Calculating Work <i class="fas fa-spinner fa-spin"></i></div>
            <div class="status ready" :class="{active: ready === true}">Ready <i class="fas fa-check"></i></div>
        </div>
        <div class="inner">
          <div class="headingtitle top">Wallet <span id="closewallet" class="mla" @click="open = false"><i class="fad fa-sign-out-alt"></i></span></div>
          <div id="output">
            <div class="balance">
              <div class="value" v-html="abbreviateNumber(balance)"></div>
              <div class="raw">{{ balance }}</div>
            </div>
          </div>
          <div class="headingtitle">History</div>
          <div id="pendingblocks"></div>
          <transaction
            v-for="transaction in pending"
            :key="transaction.hash"
            :transaction="transaction"
             v-on:blockdetails="blockdetails = $event"
             :type="pending"
          ></transaction>

          <transaction
            v-for="transaction in history"
            :key="transaction.hash"
            :transaction="transaction"
             v-on:blockdetails="blockdetails = $event"
          ></transaction>
        </div>
        <div id="walletmenu" class="menu">
          <div class="bg"></div>
          <div class="content">
            <div data-tab="#receive" @click="receive = true">Receive</div>
            <div data-tab="#send" @click="send = true">Send</div>
            <div data-tab="#settings" @click="settings = true">Settings</div>
          </div>
        </div>
      </div>
      <div id="send" class="page" :class="{active: send !== false}">
        <a class="close" @click="send = false"><i class="fal fa-times"></i></a>
        <send></send>
      </div>
      <div id="settings" class="page" :class="{active: settings !== false}">
        <a class="close" @click="settings = false"><i class="fal fa-times"></i></a>
        <settings
          :representative="representative"
        ></settings>
      </div>
      <div id="receive" class="page" :class="{active: receive !== false}">
        <a class="close" @click="receive = false"><i class="fal fa-times"></i></a>
        <receive
          :address="address"
        ></receive>
      </div>
      <div id="blockdetails" class="page" :class="{active: blockdetails !== null}">
        <a class="close" @click="blockdetails = null"><i class="fal fa-times"></i></a>
        <block-state :details="blockdetails"></block-state>
      </div>
      <div id="scan" class="page" :class="{active: scan !== false}">
        <a class="close" @click="scan = false"><i class="fal fa-times"></i></a>
        <div id="qrpreview"></div>
      </div>

  </div>
</template>

<script>
// @ is an alias to /src
import Transaction from '@/components/Transaction.vue'
import Send from '@/views/Send.vue'
import Receive from '@/views/Receive.vue'
import Settings from '@/views/Settings.vue'
import BlockState from '@/components/BlockState.vue'
import { serverMixin } from '../mixins/serverMixin.js'
import * as NanoCurrency from 'nanocurrency'

export default {
  name: 'Home',
  components: {
    Transaction,
    Send,
    Receive,
    Settings,
    BlockState
  },
  mixins: [ serverMixin ],
  data() {
    return {
      key: null,
      open: false,
      details: null,
      error: null,
      ready: false,
      pow: null,
      balance: 0,
      receive: false,
      genwallet: false,
      send: false,
      settings: false,
      scan: false,
      representative: '',
      blockdetails: null,
      history: [],
      pending: [], 
      address: null,
      logintype: 'password',
      walletdata: null
    }
  },
  watch: {
    open: function (newopen, oldpopen) {
      if(newopen === true && oldpopen === false && this.key !== null) {
        this.genWork(this.key)
        this.getHistory(this.address)
        this.getPending(this.address)
      }
    },
    pow: function (newpow/*, oldpow */) {
      if(open === true && newpow === null) {
        this.genWork(this.key)
      }
    }
  },
  computed: {
    loginicon () {
      return (this.logintype === 'password') ? 'fa-eye' : 'fa-eye-slash'
    }
  },
  methods: {
    togglevisibility () {
      console.log(this.logintype)
      this.logintype = (this.logintype === 'password') ? 'text' : 'password'
    },
    getAddress (key) {
      console.log(key)
      const publickey = NanoCurrency.derivePublicKey(key)
      return NanoCurrency.deriveAddress(publickey,{useNanoPrefix:true})
    },
    async openWallet () {
      this.error = null
      if(this.key) {
        try {
          const info = {
            action: 'account_info',
            representative: 'true',
            account: this.getAddress(this.key)
          }
          this.details = await this.rpCall(info)

          if('error' in this.details) {
            this.error = this.details.error
          } else {
            this.open = true
            this.balance = NanoCurrency.convert(this.details.balance,this.rawconv);
            this.representative = this.details.representative;
            this.address = info.account
          }

        } catch(e) {
          this.error = e
        }

        console.log(this.details)
      }
    }
  }
}
</script>
