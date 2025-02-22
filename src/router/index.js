import { createRouter, createWebHistory } from 'vue-router'; // Dùng createWebHistory
import HomeView from '../views/HomeView.vue';
import { jwtDecode } from 'jwt-decode';

import { useCookies } from "vue3-cookies";

const { cookies } = useCookies(); // Lấy cookies API

const router = createRouter({
  history: createWebHistory(),  // Cấu hình sử dụng history mode
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: false},
    },
    {
      path: '/company/signup',
      name: 'register',
      component: () => import('../views/Register.vue'),
      meta: { requiresAuth: true, role: 'COMPANY'},
    },
    {
      path: "/payment-result",
      name: "PaymentResult",
      component: () => import("../views/PaymentResult.vue"),
      meta: { requiresAuth: false},
    },
    {
      path: "/company/login",
      name: "login",
      component: () => import('../views/LoginView.vue'),
      meta: { requiresAuth: false},
    },
    {
      path: "/company/reset-password",
      name: "ResetPassword",
      component: () => import('@/views/ForgotPassword.vue'),
      meta: { requiresAuth: false},
    },
    {
      path: '/company/create',
      name: 'CreateCompany',
      component: () => import('../views/CreateCompanyView.vue'),
      meta: { requiresAuth: true, role: 'COMPANY'},
    },
    {
      path: "/company",
      name: "Company",
      component: () => import("../views/CompanyView.vue"),
      meta: { requiresAuth: true, role: 'COMPANY' ,userInfo: null},
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
      meta: { requiresAuth: true, role: 'COMPANY'},
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
      meta: { requiresAuth: true, role: 'COMPANY'},
    },
    // Catch-all route for 404 - Page Not Found
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/NotFoundView.vue'),
      meta: { requiresAuth: false},
    }
  ]
});


router.beforeEach((to, from, next) => {

  if (to.meta.requiresAuth) {
    console.log('🔒 This route requires authentication');

    const token = cookies.get('token');
    console.log('📌 Token from cookies:', token);

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        console.log('🔑 Decoded Token:', decodedToken);

        const userRole = decodedToken.role;
        console.log('👤 User Role:', userRole);

        if (to.meta.role && to.meta.role !== userRole) {
          console.warn('⛔ Không đủ quyền, chuyển về home');
          return next({ name: 'home' });
        }

        return next();
      } catch (error) {
        console.error('⚠️ Token không hợp lệ:', error);
        Cookies.remove('token'); // Xóa token lỗi
        return next({ name: 'Login' });
      }
    } else {
      console.warn('🔴 Không tìm thấy token, chuyển về login');
      return next({ name: 'Login' });
    }
  } else {
    console.log('✅ Route không yêu cầu xác thực, tiếp tục...');
    return next();
  }
});



export default router;
