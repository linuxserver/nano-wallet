import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Block from '../views/Block.vue'
// import Node from '../views/Node.vue'
import Generate from '../views/Generate.vue'
import Address from '../views/Address.vue'

Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/generate',
    name: 'Generate',
    component: Generate
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: '/block/:hash',
    name: 'Block',
    component: Block
  },
  {
    path: '/address/:address',
    name: 'Address',
    component: Address
  },
  {
    path: '/pos/:address',
    name: 'POS',
    component: Home
  },

  {
    path: '/:node',
    name: 'Home',
    component: Home
  },
  {
    path: '/:node/generate',
    name: 'Generate',
    component: Generate
  },
  {
    path: '/:node/block/:hash',
    name: 'Block',
    component: Block
  },
  {
    path: '/:node/address/:address',
    name: 'Address',
    component: Address
  },
  {
    path: '/:node/pos/:address',
    name: 'POS',
    component: Home
  }
]

const router = new VueRouter({
  routes
})

export default router
