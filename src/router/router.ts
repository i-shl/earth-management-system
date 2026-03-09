import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/LoginPage.vue')
  },
  {
    path: '/management',
    name: 'Management',
    component: () => import('../views/management/ManagementLayout.vue'),
    redirect: '/management/overview',
    children: [
      {
        path: 'overview',
        name: 'Overview',
        component: () => import('../views/management/overview/OverviewIndex.vue')
      },
      {
        path: 'continents',
        name: 'Continents',
        component: () => import('../views/management/geography/ContinentsView.vue')
      },
      {
        path: 'oceans',
        name: 'Oceans',
        component: () => import('../views/management/geography/OceansView.vue')
      },
      {
        path: 'countries',
        name: 'Countries',
        component: () => import('../views/management/geography/CountriesView.vue')
      },
      {
        path: 'humans',
        name: 'Humans',
        component: () => import('../views/management/biosphere/HumansView.vue')
      },
      {
        path: 'species',
        name: 'Species',
        component: () => import('../views/management/biosphere/SpeciesView.vue')
      },
      {
        path: 'environment',
        name: 'Environment',
        component: () => import('../views/management/environment/EnvironmentView.vue')
      },
      {
        path: 'atmosphere',
        name: 'Atmosphere',
        component: () => import('../views/management/environment/AtmosphereView.vue')
      },
      {
        path: 'weather',
        name: 'Weather',
        component: () => import('../views/management/environment/ClimateView.vue')
      },
      {
        path: 'resources',
        name: 'Resources',
        component: () => import('../views/management/resources/ResourcesView.vue')
      },
      {
        path: 'events',
        name: 'Events',
        component: () => import('../views/management/operations/EventsView.vue')
      },
      {
        path: 'logs',
        name: 'Logs',
        component: () => import('../views/management/operations/LogsView.vue')
      },
      {
        path: 'satellites',
        name: 'Satellites',
        component: () => import('../views/management/operations/SatellitesView.vue')
      }
    ]
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/dashboard/FullScreenMonitor.vue')
  },
  // 404
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 导航守卫 (简单示例)
router.beforeEach((to, _from, next) => {
  const isAuth = localStorage.getItem('isAuthenticated') === 'true'
  
  if (to.name !== 'Login' && !isAuth) {
    next({ name: 'Login' })
  } else if (to.name === 'Login' && isAuth) {
    next({ name: 'Overview' })
  } else {
    next()
  }
})

export default router