import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login,
  },
  {
    path: '/home',
    component: () => import ('views/home/Home'),
    redirect: '/home/welcome',
    children: [
      {path: 'welcome',component: () => import('views/home/childComps/Welcome')},
      {path: 'users',component: () => import('views/user/Users')},
      {path: 'roles',component: () => import('views/power/Roles')},
      {path: 'rights',component: () => import('views/power/Rights')},
      {path: 'goods',component: () => import('views/goods/Goods')},
      {path: 'params',component: () => import('views/goods/Params')},
      {path: 'categories',component: () => import('views/goods/Categories')},
      {path: 'orders',component: () => import('views/home/childComps/Orders')},
      {path: 'reports',component: () => import('views/home/childComps/Reports')},
    ]
  },
]

const router = new VueRouter({
  mode: 'history',
  routes
})

router.beforeEach((to, from, next) => {
  const tokenStr = window.sessionStorage.getItem('token')
  if (to.path === '/login') {
    // if (tokenStr) {  // 访问login如果存在token直接登录到首页
    //   return next('/home')
    // }
    return next()
  }  // 访问login直接放行
  if (!tokenStr) return next('/login')  // 如果没有token，跳转到login
  next()
  
})

export default router
