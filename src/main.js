import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// import { NanoCurrency } from 'nanocurrency'
import Notifications from 'vue-notification'
Vue.use(Notifications)
// Vue.use(NanoCurrency)
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
