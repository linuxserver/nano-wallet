<template>
  <div class="wallet">
    <div type="hidden" id="workstorage"></div>
      <div id="login" class="page active" :class="{ active: open===false }">
        <div class="title">Current RPC Server: {{ $route.params.node }}</div>
        <div id="inputs">
          <div v-if="error !== null" class="error">{{ error }}</div>
          <label for="key">Private Key</label>
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
          <div class="headingtitle top"><span>Wallet<span class="refresh rotate" @click="refresh" :class="{ down: isActive }"><i class="fad fa-sync-alt"></i></span></span> <span id="closewallet" class="mla" @click="logout"><i class="fad fa-sign-out-alt"></i></span></div>
          <div id="output">
            <div class="balance">
              <div @click="copyToClipboard(address)" class="raw">{{ address }}</div>
              <div class="value" v-html="abbreviateNumber(balance)"></div>
              <div class="raw">{{ balance }}</div>
            </div>
          </div>
          <div class="headingtitle">History</div>
          <div id="pendingblocks"></div>
          <transaction
            v-for="(transaction, index) in pending"
            :key="index"
            :index="index"
            :transaction="transaction"
            v-on:blockdetails="blockdetails = $event"
            type="pending"
            @receive="refreshDetails"
          ></transaction>

          <transaction
            v-for="(transaction, index) in history"
            :key="index"
            :index="index"
            :transaction="transaction"
            v-on:blockdetails="blockdetails = $event"
            :type="transaction.type"
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
        <send @close="send = false"></send>
      </div>
      <div id="settings" class="page" :class="{active: settings !== false}">
        <a class="close" @click="settings = false"><i class="fal fa-times"></i></a>
        <settings
          :representative="representative"
          @change="refreshDetails"
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
import Worker from 'worker-loader!./../mixins/pow.js'

function initialState (){
  return {
    key: null,
    open: false,
    details: null,
    error: null,
    balance: 0,
    receive: false,
    genwallet: false,
    send: false,
    settings: false,
    representative: '',
    blockdetails: null,
    address: null,
    logintype: 'password',
    walletdata: null,
    isActive: false
  }
}

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
    return initialState();
  },
  watch: {
    open: function (newopen) {
      if(newopen === true && this.key !== null) {
        this.refreshDetails()
      }
    },
    pow: async function (newpow/*, oldpow */) {
      if(this.open === true && newpow === null) {
        this.refreshDetails()
      }
    }
  },
  mounted () {
    this.$store.commit('app/node', this.$route.params.node)
  },
  computed: {
    loginicon () {
      return (this.logintype === 'password') ? 'fa-eye' : 'fa-eye-slash'
    },
    pow () {
      return this.$store.state.app.pow
    },
    ready () {
      return this.$store.state.app.ready
    },
    history () {
      return this.$store.state.app.history
    },
    pending () {
      return this.$store.state.app.pending
    },
    privatekey () {
      return this.$store.state.app.privatekey
    }
  },
  methods: {
    /* pasteKey () {
      this.key = this.pasteFromClipboard()
    }, */
    logout () {
        Object.assign(this.$data, initialState());
        this.$store.commit('app/pending', [])
        this.$store.commit('app/history', [])
        this.$store.commit('app/ready', false)
        this.$store.commit('app/pow', null)
        this.$store.commit('app/privatekey', null)
    },
    refresh () {
      this.isActive = !this.isActive
      this.refreshDetails()
    },
    async refreshDetails () {
        await this.getDetails(this.privatekey)
        this.$store.commit('app/pow', null)
        this.$store.commit('app/ready', false)
        this.genWork(this.privatekey, this.details)
        this.$store.dispatch('app/history', this.address)
        this.$store.dispatch('app/pending', this.address)
        this.balance = NanoCurrency.convert(this.details.balance,this.rawconv);
    },
    async genWork (key, details){
      let hash
      if ('frontier' in details){
        console.log('Frontier in details');
        hash = details.frontier
      } else {
        console.log('Frontier NOT in details');
        hash = NanoCurrency.derivePublicKey(key)
      }

      if (window.Worker) {
        console.log('Calculating pow for ' + hash + ' this may take some time');
        const hardwareConcurrency = window.navigator.hardwareConcurrency || 2;
        const workerCount = Math.max(hardwareConcurrency - 1, 1);
        const work = () => new Promise(resolve => {
          const workerList = [];
          for (let i = 0; i < workerCount; i++) {
            const worker = new Worker()
            worker.postMessage({
              blockHash: hash,
              workerIndex: i,
              workerCount: workerCount
            });
            worker.onmessage = (work) => {
              console.log('Work: ' + work.data);
              
              this.$store.commit('app/pow', work.data)
              this.$store.commit('app/ready', true)

              for (let workerIndex in workerList) {
                console.log('Terminate: ' + workerIndex)
                workerList[workerIndex].terminate();
              }
              resolve();
            };
            workerList.push(worker);
          }
        });
        await work();
      }
      else{
        console.log('Calculating pow for ' + hash + ' (no worker) this may take some time');
        var work = await NanoCurrency.computeWork(hash);
        this.$store.commit('app/pow', work)
        this.$store.commit('app/ready', true)

      }
      // worker.postMessage(hash);
    },

    togglevisibility () {
      console.log(this.logintype)
      this.logintype = (this.logintype === 'password') ? 'text' : 'password'
    },
    getAddress (key) {
      const publickey = NanoCurrency.derivePublicKey(key)
      return NanoCurrency.deriveAddress(publickey,{useNanoPrefix:true})
    },
    async getDetails (key) {
      this.address = this.getAddress(key)
      const info = {
        action: 'account_info',
        representative: 'true',
        account: this.address
      }
      this.details = await this.$store.dispatch('app/rpCall', info)
    },
    async openWallet () {
      this.error = null
      if(this.key) {
        try {
          await this.getDetails(this.key)
          if('error' in this.details && this.details.error !== 'Account not found') {
            this.error = this.details.error
          } else {
            this.$store.commit('app/privatekey', this.key)
            
            this.open = true
            this.balance = NanoCurrency.convert(this.details.balance,this.rawconv);
            this.representative = this.details.representative;
          }

        } catch(e) {
          this.error = e
        }

      }
    }
  }
}
</script>
