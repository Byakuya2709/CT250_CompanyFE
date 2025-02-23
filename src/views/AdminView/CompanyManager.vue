<template>
  <div class="container mt-4 p-4 bg-white shadow rounded">
    <h2 class="text-center text-primary fw-bold mb-4">Quản lý Công Ty</h2>
    <div class="row">
      <div v-for="company in companies" :key="company.id" class="col-md-6 mb-4">
        <div class="card shadow-sm">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <img :src="company.logoURL" alt="Logo" class="logo me-3" />
              <div>
                <h5 class="card-title text-primary">
                  {{ company.companyName }}
                </h5>
                <p class="mb-1">
                  <strong>Email:</strong> {{ company.companyMail }}
                </p>
                <p class="mb-1">
                  <strong>Điện thoại:</strong> (+84) {{ company.companyPhone }}
                </p>
                <p class="mb-1">
                  <strong>Địa chỉ:</strong> {{ company.companyAddress }}
                </p>
                <p class="mb-0">
                  <strong>Ngày thành lập:</strong> {{ formatDate(company.publishDate) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="d-flex justify-content-between align-items-center mt-4">
      <button @click="prevPage" :disabled="currentPage === 1" class="btn btn-outline-primary">
        <i class="fas fa-chevron-left"></i> Trang trước
      </button>
      <span class="fw-bold">Trang {{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage >= totalPages" class="btn btn-outline-primary">
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
</style>

<script>
import { api } from "@/api/Api";
import Swal from "sweetalert2";
export default {
  data() {
    return {
      companies: [],
      currentPage: 1,
      itemsPerPage: 10,
      totalPages: 1,
      totalElements: 0,
    };
  },
  methods: {
    async fetchAccounts() {
      try {
        const response = await api.get(
          `/admins/accounts/profiles/company?page=${
            this.currentPage - 1
          }&size=${this.itemsPerPage}`
        );
        this.companies = response.data.data.content;
        this.totalPages = response.data.data.totalPages;
        this.totalElements = response.data.data.totalElements;
      } catch (error) {
        this.$toast.error(
          error.response?.data?.message || "Lỗi khi lấy danh sách tài khoản"
        );
        console.error("Lỗi khi lấy danh sách tài khoản:", error);
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.fetchAccounts();
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.fetchAccounts();
      }
    },
    formatDate(date) {
      return new Date(date).toISOString().split("T")[0];
    },
  },
  mounted() {
    this.fetchAccounts();
  },
};
</script>
