<template>
  <div id="user" class="d-flex">
    <div id="logo-sidebar" class="sidebar">
      <div class="h-100 px-3 pt-4 pb-2 overflow-auto">
        <ul class="nav flex-column">
          <div
            class="user-info mt-4 d-flex align-items-center"
            style="flex-direction: column"
          >
            <img
              :src="`https://res.cloudinary.com/dtza0pk4w/image/upload/v1734758873/default_avatar.jpg`"
              alt="User Avatar"
              class="avatar"
            />
            <div class="ms-3">
              <p class="user-name">{{ this.email }}</p>
              <p class="user-role" v-if="role">Vai trò: {{ role }}</p>
            </div>
          </div>
          <li class="nav-item mb-2" v-for="item in navItems" :key="item.name">
            <router-link :to="item.path" class="nav-link">
              <svg
                class="bi text-secondary"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 16 16"
                width="20"
                height="20"
              >
                <path :d="item.iconPath" />
              </svg>
              <span class="ms-2">{{ item.name }}</span>
            </router-link>
          </li>
        </ul>
        <!-- User info -->
      </div>
    </div>

    <div class="container router-view">
      <RouterView />
    </div>
  </div>
</template>

<script>
import { useCookies } from "vue3-cookies";
const { cookies } = useCookies(); // Lấy cookie API

export default {
  name: "Admin",
  data() {
    return {
      email: cookies.get("email") || "ADMIN_ACCOUNT",
    };
  },
  computed: {
    user() {
      return this.$authStore.user;
    },
    role() {
      return this.$authStore.role;
    },
    navItems() {
      return [
        // {
        //   name: "Quản Lý Vé Sự Kiện",
        //   path: "/admin/tickets",
        //   iconPath:
        //     "M2 3.5V2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1.5h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1h1zm11-1V2a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v.5H2v10h12v-10h-1z M9 8H7v4h2V8zm1-3H6v2h4V5z",
        // },
        {
          name: "Quản Lý Sự Kiện",
          path: `/admin/events`,
          iconPath:
            "M2 3.5V2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1.5h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1h1zm11-1V2a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v.5H2v10h12v-10h-1z M9 8H7v4h2V8zm1-3H6v2h4V5z",
        },
        {
          name: "Quản Lý Tài khoản",
          path: `/admin/accounts`,
          iconPath:
            "M2 3.5V2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1.5h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1h1zm11-1V2a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v.5H2v10h12v-10h-1z M9 8H7v4h2V8zm1-3H6v2h4V5z",
        },
        {
          name: "Quản Lý Người Dùng",
          path: `/admin/companies`,
          iconPath:
            "M2 3.5V2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1.5h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1h1zm11-1V2a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v.5H2v10h12v-10h-1z M9 8H7v4h2V8zm1-3H6v2h4V5z",
        },
        // {
        //   name: "Quản Lý Người Dùng",
        //   path: `/admin/users`,
        //   iconPath:
        //     "M2 3.5V2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1.5h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1h1zm11-1V2a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v.5H2v10h12v-10h-1z M9 8H7v4h2V8zm1-3H6v2h4V5z",
        // },
        {
          name: "Quản Lý Đơn Xét Duyệt",
          path: `/admin/submissions`,
          iconPath:
            "M2 3.5V2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1.5h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1h1zm11-1V2a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v.5H2v10h12v-10h-1z M9 8H7v4h2V8zm1-3H6v2h4V5z",
        },
        // {
        //   name: "Quản Lý Hoàn Trả Vé",
        //   path: `/admin/blog`,
        //   iconPath:
        //     "M2 3.5V2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1.5h1a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1h1zm11-1V2a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v.5H2v10h12v-10h-1z M9 8H7v4h2V8zm1-3H6v2h4V5z",
        // },
      ];
    },
  },
};
</script>

<style scoped>
.sidebar {
  background-color: #f8f9fa; /* Màu nền sáng hơn */
  border-right: 1px solid #dee2e6;
  width: 250px;
}
.router-view {
  max-width: 100%;
  margin: auto;
}
.nav-link {
  display: flex;
  align-items: center;
  padding: 12px;
  color: #495057;
  border-radius: 5px;
  transition: background-color 0.2s;
}

.nav-link:hover {
  background-color: #e9ecef; /* Màu nền khi hover */
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 50px; /* Kích thước lớn hơn */
  height: 50px; /* Chiều cao tương ứng */
  border-radius: 50%; /* Hình tròn */
  border: 2px solid #007bff; /* Viền cho ảnh đại diện */
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.5); /* Bóng đổ cho ảnh đại diện */
}

.user-name {
  margin-top: 10px;
  font-weight: bold;
  font-size: 1.1em; /* Kích thước chữ lớn hơn */
  margin-bottom: 0; /* Giảm khoảng cách bên dưới */
}

.user-email {
  font-size: 0.9em; /* Kích thước chữ cho email */
  color: #6c757d; /* Màu chữ nhạt hơn */
  margin-bottom: 0; /* Giảm khoảng cách bên dưới */
}

.user-role {
  text-align: center;
  font-size: 0.8em; /* Kích thước chữ cho vai trò */
  color: #6c757d; /* Màu chữ nhạt hơn */
}
</style>
