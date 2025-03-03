<template>
  <div class="container mt-4 p-4 bg-white shadow rounded">
    <h2 class="text-center text-primary fw-bold mb-4">
      Quản lý Công Ty Tổ chức sự kiện
    </h2>
    <div class="row">
      <div v-for="company in companies" :key="company.id" class="col-md-6 mb-4">
        <div class="card shadow-sm">
          <div
            class="card-body"
            :class="company.accountId ? 'has-account' : 'not-has-account'"
          >
            <div class="d-flex align-items-center">
              <img :src="company.logoURL" alt="Logo" class="logo me-3" />
              <div>
                <h5
                  class="card-title text-primary"
                  :title="
                    company.accountId
                      ? ''
                      : 'Tài khoản của người dùng này đã bị xóa'
                  "
                >
                  {{ company.companyName }}
                  <i
                    v-if="company.accountId"
                    class="fas fa-check-circle text-success"
                  ></i>
                  <i v-else class="fas fa-exclamation-circle text-danger"></i>
                </h5>

                <p class="mb-1">
                  <strong>Email:</strong> {{ company.companyMail }}
                </p>
                <p class="mb-1">
                  <strong>Điện thoại liên lạc:</strong> (+84)
                  {{ company.companyPhone }}
                </p>
                <p class="mb-1">
                  <strong>Trụ sở:</strong> {{ company.companyAddress }}
                </p>
                <p class="mb-0">
                  <strong>Ngày thành lập:</strong>
                  {{ formatDate(company.publishDate) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="d-flex justify-content-between align-items-center mt-4">
      <button
        @click="prevPage"
        :disabled="currentPage === 1"
        class="btn btn-outline-primary"
      >
        <i class="fas fa-chevron-left"></i> Trang trước
      </button>
      <span class="fw-bold">Trang {{ currentPage }} / {{ totalPages }}</span>
      <button
        @click="nextPage"
        :disabled="currentPage >= totalPages"
        class="btn btn-outline-primary"
      >
        Trang sau <i class="fas fa-chevron-right"></i>
      </button>
    </div>

    <h2 class="text-center text-primary fw-bold mt-5">Quản lý Người Dùng</h2>
    <div class="row">
      <div v-for="user in users" :key="user.id" class="col-md-6 mb-4">
        <div class="card shadow-sm">
          <div
            class="card-body"
            :class="user.accountId ? 'has-account' : 'not-has-account'"
          >
            <div class="d-flex align-items-center">
              <img :src="user.imageURL" alt="Avatar" class="logo me-3" />
              <div>
                <h5 class="card-title text-primary"
                :title="user.accountId ? '' : 'Tài khoản của người dùng này đã bị xóa'">
                  {{ user.userName }}
                  <i
                    v-if="user.accountId"
                    class="fas fa-check-circle text-success"
                  ></i>
                  <i v-else class="fas fa-exclamation-circle text-danger"></i>
                </h5>

                <p class="mb-1"><strong>Email:</strong> {{ user.userMail }}</p>
                <p class="mb-1">
                  <strong>Điện thoại:</strong> (+84) {{ user.userPhone }}
                </p>
                <p class="mb-1">
                  <strong>Địa chỉ:</strong> {{ user.userAddress }}
                </p>
                <p class="mb-0">
                  <strong>Ngày sinh:</strong> {{ formatDate(user.userBirth) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="d-flex justify-content-between align-items-center mt-4">
      <button
        @click="prevPageUser"
        :disabled="currentPageUser === 1"
        class="btn btn-outline-primary"
      >
        <i class="fas fa-chevron-left"></i> Trang trước
      </button>
      <span class="fw-bold"
        >Trang {{ currentPageUser }} / {{ totalPagesUser }}</span
      >
      <button
        @click="nextPageUser"
        :disabled="currentPageUser >= totalPagesUser"
        class="btn btn-outline-primary"
      >
        Trang sau <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<style scoped>
.logo {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 5px;
}
.card {
  border-radius: 10px;
  transition: transform 0.2s ease-in-out;
}
.card:hover {
  transform: scale(1.02);
}
.has-account {
  background-color: #d8f8dfb9; /* Màu xanh nhạt để chỉ ra có account */
  border-left: 5px solid #28a745; /* Viền xanh lá */
}
.not-has-account {
  background-color: #f17a7aa4; /* Màu xanh nhạt để chỉ ra có account */
  border-left: 5px solid #c4222a; /* Viền xanh lá */
}
</style>

<script>
import { api } from "@/api/Api";
export default {
  data() {
    return {
      companies: [],
      users: [],
      currentPage: 1,
      itemsPerPage: 10,
      totalPages: 1,

      currentPageUser: 1,
      itemsPerPageUser: 10,
      totalPagesUser: 1,
    };
  },
  methods: {
    async fetchCompany() {
      try {
        const response = await api.get(
          `/admins/accounts/profiles/company?page=${
            this.currentPage - 1
          }&size=${this.itemsPerPage}`
        );
        this.companies = response.data.data.content;
        // console.log(response.data.data.content);
        this.totalPages = response.data.data.totalPages;
      } catch (error) {
        this.$toast.error(
          error.response?.data?.message || "Lỗi khi lấy danh sách công ty"
        );
        console.error("Lỗi khi lấy danh sách công ty:", error);
      }
    },

    async fetchUsers() {
      try {
        const response = await api.get(
          `/admins/accounts/profiles/user?page=${
            this.currentPageUser - 1
          }&size=${this.itemsPerPageUser}`
        );

        this.users = response.data.data.content;
        // console.log(response.data.data.content);
        this.totalPagesUser = response.data.data.totalPages;
      } catch (error) {
        this.$toast.error(
          error.response?.data?.message || "Lỗi khi lấy danh sách người dùng"
        );
        console.error("Lỗi khi lấy danh sách người dùng:", error);
      }
    },

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.fetchCompany();
      }
    },
    prevPageUser() {
      if (this.currentPageUser > 1) {
        this.currentPageUser--;
        this.fetchUsers();
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.fetchCompany();
      }
    },
    nextPageUser() {
      if (this.currentPageUser < this.totalPagesUser) {
        this.currentPageUser++;
        this.fetchUsers();
      }
    },
    formatDate(date) {
      return new Date(date).toISOString().split("T")[0];
    },
  },
  mounted() {
    this.fetchCompany();
    this.fetchUsers();
  },
};
</script>
