import { createRouter, createWebHistory } from "vue-router"; // Dùng createWebHistory
import HomeView from "../views/HomeView.vue";
import { jwtDecode } from "jwt-decode";

import { useCookies } from "vue3-cookies";

const { cookies } = useCookies(); // Lấy cookies API

const router = createRouter({
  history: createWebHistory(), // Cấu hình sử dụng history mode
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/HomePage.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/about",
      name: "About",
      component: () => import("../views/AboutView.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/event/:eventId",
      name: "PublicEvent",
      component: () => import("../views/EventView/PublicEventDetail.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/company/signup",
      name: "register",
      component: () => import("../views/Register.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/payment-result",
      name: "PaymentResult",
      component: () => import("../views/PaymentResult.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/company/login",
      name: "login",
      component: () => import("../views/LoginView.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/admin/login",
      name: "Adminlogin",
      component: () => import("../views/AdminLoginView.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/company/reset-password",
      name: "ResetPassword",
      component: () => import("@/views/ForgotPassword.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/company/create",
      name: "CreateCompany",
      component: () => import("../views/CreateCompanyView.vue"),
      meta: { requiresAuth: true, role: "COMPANY" },
    },
    {
      path: "/admin",
      name: "Admin",
      component: () => import("../views/AdminView/Admin.vue"),
      meta: { requiresAuth: true, role: "ADMIN" },
      children: [
        {
          path: "",
          alias: ['dashboard'],
          name: "AdminDashboard",
          component: () => import("../views/AdminView/DashBoard.vue"),
        },
        {
          path: "accounts",
          name: "AccountManager",
          component: () => import("@/views/AdminView/AccountManager.vue"),
        },
        {
          path: "companies",
          name: "CompanyManager",
          component: () => import("@/views/AdminView/CompanyManager.vue"),
        },
        {
          path: "events",
          name: "EventManager",
          component: () => import("@/views/AdminView/EventManager.vue"),
        },
        {
          path: "submissions",
          name: "SubmissionManager",
          component: () => import("@/views/AdminView/SubmissionManager.vue"),
        },
      ]
    },

    {
      path: "/company",
      name: "Company",
      component: () => import("../views/CompanyView.vue"),
      meta: { requiresAuth: true, role: "COMPANY", userInfo: null },
      children: [

        {
          path: "profile",
          name: "Profile",
          component: () => import("@/views/CompanyView/CompanyProfile.vue"),
          props: (route) => ({ userInfo: route.meta.userInfo }),
        },

        //tạo blog từ company
        {
          path: "/company/:companyId/create/blog",
          name: "CreateBlog",
          component: () => import("../views/CompanyView/BlogCreate.vue"),
          meta: { requiresAuth: true, role: "COMPANY" }
        },

        //trang xem bài viết được đăng bởi companyUser
        {
          path: "/company/:companyId/blogManager",
          name: "BlogManager",
          component: () => import("../views/CompanyView/BlogManagement.vue"),
          meta: { requiresAuth: true, role: "COMPANY" }
        },
        {
          path: ":companyId/create/event",
          name: "EventsCreate",
          component: () => import("../views/EventCreateView.vue"),
        },
        {
          path: ":companyId/tickets",
          name: "Events",
          component: () => import("../views/CompanyView/TicketManager.vue"),
        },
        // {
        //   path: ":companyId/create/event/:eventId/submission",
        //   name: "EventSubmissions",
        //   component: () => import("../views/CompanyView/CreateSubmission.vue"),
        //   props: (route) => ({ userInfo: route.meta.userInfo }),
        // },
        {
          path: ":companyId/events",
          name: "EventsList",
          component: () => import("../views/CompanyView/AllEvent.vue"),
        },
        {
          path: ":companyId/dashboard",
          name: "CompanyDasboard",
          component: () => import("../views/CompanyView/Dasboard.vue"),
        },
        {
          path: "/company/:companyId/events/:eventId/update",
          name: "EventUpdate",
          component: () => import("../views/EventView/EventUpdate.vue"),
          props: (route) => ({ userInfo: route.meta.userInfo }),
        },
      ],
    },

    //xem chi tiết blog 
    {
      path: "/company/blog/:blogId",
      name: "BlogDetails",
      component: () => import("../views/CompanyView/BlogDetail.vue"),
      meta: { requiresAuth: true, role: "COMPANY", userInfo: null  },
    },

    //xem danh sách blog
    {
      path: "/company/blog/",
      name: "AllBlogDetails",
      component: () => import("../views/AllBlogView.vue"),
      meta: { requiresAuth: true, role: "COMPANY", userInfo: null  },
    },

    {
      path: "/company/events/:eventId",
      name: "EventDetails",
      component: () => import("../views/EventView/EventDetail.vue"),
      meta: { requiresAuth: true, role: "COMPANY" },
      children: [
        {
          path: "booking",
          name: "EventBooking",
          component: () => import("../views/EventView/EventBooking.vue"),
          meta: { modal: true }, // Đánh dấu route này là modal
        },
        {
          path: "booking/all-day",
          name: "EventBookingAllDay",
          component: () => import("../views/EventView/EventBookingAllDay.vue"),
          meta: { modal: true },
        },
      ],
    },

    {
      path: "/company/events/all",
      name: "ListEvents",
      component: () => import("../views/AllEventView.vue"),
      meta: { requiresAuth: true, role: "COMPANY" },
    },
    // Catch-all route for 404 - Page Not Found
    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: () => import("../views/NotFoundView.vue"),
      meta: { requiresAuth: false },
    },
  ],
});

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    console.log("🔒 This route requires authentication");

    const token = cookies.get("token");
    console.log("📌 Token from cookies:", token);

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        console.log("🔑 Decoded Token:", decodedToken);

        const userRole = decodedToken.role;
        console.log("👤 User Role:", userRole);

        if (to.meta.role && to.meta.role !== userRole) {
          console.warn("⛔ Không đủ quyền, chuyển về home");
          return next({ name: "home" });
        }

        return next();
      } catch (error) {
        console.error("⚠️ Token không hợp lệ:", error);
        Cookies.remove("token"); // Xóa token lỗi
        return next({ name: "Login" });
      }
    } else {
      console.warn("🔴 Không tìm thấy token, chuyển về login");
      return next({ name: "Login" });
    }
  } else {
    console.log("✅ Route không yêu cầu xác thực, tiếp tục...");
    return next();
  }
});

export default router;
