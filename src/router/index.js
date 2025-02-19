import { createRouter, createWebHistory } from 'vue-router'; // Dùng createWebHistory
import HomeView from '../views/HomeView.vue';
import { jwtDecode } from 'jwt-decode';

const router = createRouter({
  history: createWebHistory(),  // Cấu hình sử dụng history mode
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/company/signup',
      name: 'register',
      component: () => import('../views/Register.vue')
    },
    {
      path: "/payment-result",
      name: "PaymentResult",
      component: () => import("../views/PaymentResult.vue")
    },
    {
      path: "/company/login",
      name: "login",
      component: () => import('../views/LoginView.vue')
    },
    {
      path: "/company/reset-password",
      name: "ResetPassword",
      component: () => import('@/views/ForgotPassword.vue')
    },
    {
      path: '/company/create',
      name: 'CreateCompany',
      component: () => import('../views/CreateCompanyView.vue')
    },
    {
      path: "/company",
      name: "Company",
      component: () => import("../views/CompanyView.vue"),
      children: [
        {
          path: "profile",
          name: "Profile",
          component: () => import("@/views/CompanyView/CompanyProfile.vue"),
          props: route => ({ userInfo: route.meta.userInfo })
        },
        {
          path: ':companyId/create/event',
          name: 'Events',
          component: () => import('../views/EventCreateView.vue'),
        },
        {
          path: ':companyId/create/event/:eventId/submission',
          name: 'EventSubmissions',
          component: () => import('../views/CompanyView/CreateSubmission.vue'),
          props: route => ({ userInfo: route.meta.userInfo })
        },
        {
          path: ':companyId/events',
          name: 'EventsList',
          component: () => import('../views/CompanyView/AllEvent.vue'),
        },
        {
          path: ':companyId/dashboard',
          name: 'CompanyDasboard',
          component: () => import('../views/CompanyView/Dasboard.vue'),
        },
        {
          path: '/company/:companyId/events/:eventId/update',
          name: 'EventUpdate',
          component: () => import('../views/EventView/EventUpdate.vue'),
          props: route => ({ userInfo: route.meta.userInfo })
        },
      ],
      meta: { userInfo: null } // Dùng meta để lưu userInfo
    }
    ,
    // {
    //   path: '/company/events',
    //   name: 'Events',
    //   component: () => import('../views/EventCreateView.vue'),
    // },
    {
      path: '/company/events/:eventId',
      name: 'EventDetails',
      component: () => import('../views/EventView/EventDetail.vue'),
      children: [
        {
          path: 'booking',
          name: 'EventBooking',
          component: () => import('../views/EventView/EventBooking.vue'),
          meta: { modal: true }, // Đánh dấu route này là modal
        },
        {
          path: 'booking/all-day',
          name: 'EventBookingAllDay',
          component: () => import('../views/EventView/EventBookingAllDay.vue'),
          meta: { modal: true },
        }
      ]
    },

    {
      path: '/company/events/all',
      name: 'ListEvents',
      component: () => import('../views/AllEventView.vue'),
    },
    // Catch-all route for 404 - Page Not Found
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/NotFoundView.vue')
    }
  ]
});

// Add navigation guard
router.beforeEach((to, from, next) => {

  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const role = decodedToken.role;

        // If the route requires ROLE_ADMIN and the user is not an admin, redirect to home
        if (to.path.startsWith('/admin') && role !== 'ROLE_ADMIN') {
          next({ name: 'home' });
        } else {
          // Allow access if the role matches the required role or if no specific role is required
          next();
        }
      } catch (error) {
        // If decoding the token fails, redirect to login
        next({ name: 'Login' });
      }
    } else {
      // If the user is not authenticated, redirect to login
      next({ name: 'Login' });
    }
  } else {
    // Allow access to routes that don't require authentication
    next();
  }
});

export default router;
