import Vue from 'vue'
import Router from 'vue-router'
// import HelloWorld from '@/components/HelloWorld'

Vue.use(Router)

const mainBox = () => import('@/components/MainBox')

export default new Router({
  routes: [
    {
      path: '/',
      name: 'MainBox',
      component: mainBox
    }
  ]
})
