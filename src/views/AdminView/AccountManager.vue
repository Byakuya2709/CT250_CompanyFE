<template>
  <div class="container mt-4 p-4 bg-white shadow rounded">
    <h2 class="text-center text-primary fw-bold mb-4">Quản lý tài khoản</h2>
    <button
      class="btn-small my-2"
      style="width: auto"
      @click="showModal = true"
    >
      <i class="fas fa-plus"></i> Tạo tài khoản mới
    </button>

    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h3 class="text-center">Tạo tài khoản mới</h3>
        <form @submit.prevent="createAccount">
          <div class="mb-3">
            <label>Email:</label>
            <input
              v-model="newAccount.email"
              type="email"
              required
              class="form-control"
            />
          </div>
          <div class="mb-3">
            <label>Mật khẩu:</label>
            <input
              v-model="newAccount.password"
              type="password"
              required
              class="form-control"
            />
          </div>
          <div class="mb-3">
            <label>Vai trò:</label>
            <select v-model="newAccount.role" class="form-control">
              <option value="USER">Người dùng</option>
              <option value="COMPANY">Công ty tổ chức sự kiện</option>
            </select>
          </div>
          <div class="d-flex justify-content-between">
            <button type="submit" class="btn btn-success">Tạo tài khoản</button>
            <button
              type="button"
              @click="showModal = false"
              class="btn btn-secondary"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-bordered table-hover text-center">
        <thead class="table-primary">
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Loại</th>
            <th>Trạng thái</th>

            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="account in accounts" :key="account.id">
            <td>
              {{
                account.showFullId ? account.id : account.id.slice(0, 6) + "..."
              }}
              <button
                @click="toggleIdVisibility(account)"
                class="btn-info ms-2"
              >
                <i class="fas fa-eye"></i>
                {{ account.showFullId ? "Ẩn" : "Hiện" }}
              </button>
            </td>
            <td>{{ account.email }}</td>
            <td>{{ account.type }}</td>
            <td>
              <span
                :class="{
                  'text-success fw-bold': account.status === 'ACTIVE',
                  'text-danger fw-bold': account.status === 'INACTIVE',
                }"
              >
                {{ account.status }}
              </span>
            </td>

            <td>
              <button
                v-if="account.status === 'ACTIVE'"
                @click="blockAccount(account)"
                class="btn btn-warning btn-sm me-2"
              >
                <i class="fas fa-ban"></i> Khóa
              </button>
              <button
                v-if="account.status === 'INACTIVE'"
                @click="unblockAccount(account)"
                class="btn btn-success btn-sm me-2"
              >
                <i class="fas fa-unlock"></i> Mở Khóa
              </button>
              <button
                @click="deleteAccount(account.id)"
                class="btn btn-danger btn-sm"
              >
                <i class="fas fa-trash"></i> Xóa
              </button>
            </td>
          </tr>
        </tbody>
      </table>
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
    </div>
  </div>
</template>
<style scoped>
table {
  border-radius: 10px;
  overflow: hidden;
}
th,
td {
  padding: 12px;
  border: 1px solid #ddd;
}
th {
  background: linear-gradient(to right, #e2e8f0, #cbd5e1);
  color: #374151;
  font-weight: bold;
}
tbody tr:hover {
  background-color: #f3f4f6;
  transition: 0.2s ease-in-out;
}
.btn-small {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 6px 10px;
  font-size: 14px;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex; /* Giữ kích thước vừa đủ nội dung */
  align-items: center;
  gap: 6px; /* Khoảng cách giữa icon và chữ */
  text-decoration: none;
  width: auto; /* Ngăn chiếm toàn bộ chiều rộng */
}

.modal-overlay {
  z-index: 10000;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}
</style>
<script>
import { api } from "@/api/Api";
import Swal from "sweetalert2";
export default {
  data() {
    return {
      accounts: [],
      currentPage: 1,
      itemsPerPage: 10,
      totalPages: 1,
      totalElements: 0,

      showModal: false,
      newAccount: {
        email: "",
        password: "",
        role: "USER",
      },
    };
  },
  computed: {
    paginatedAccounts() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.accounts;
    },
  },
  methods: {
    async createAccount() {
      try {
        const res = await api.post("/admins/accounts", this.newAccount);
        this.$toast.success(res.data.message);
        // this.fetchAccounts();
        this.accounts.push(res.data.data);
        this.showModal = false;
      } catch (error) {
        this.$toast.error(
          error.response?.data?.message || "Lỗi khi lấy danh sách tài khoản"
        );
      }
    },
    async fetchAccounts() {
      try {
        const response = await api.get(
          `/admins/accounts?page=${this.currentPage - 1}&size=${
            this.itemsPerPage
          }`
        );
        this.accounts = response.data.data.content.map((account) => ({
          ...account,
          showFullId: false,
        }));
        this.totalPages = response.data.data.totalPages;
        this.totalElements = response.data.data.totalElements;
      } catch (error) {
        this.$toast.error(
          error.response?.data?.message || "Lỗi khi lấy danh sách tài khoản"
        );
        console.error("Lỗi khi lấy danh sách tài khoản:", error);
      }
    },
    async blockAccount(account) {
      const result = await Swal.fire({
        title: "Xác nhận xóa?",
        text: "Bạn có chắc chắn muốn khóa tài khoản này?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Khóa",
        cancelButtonText: "Hủy",
      });

      if (!result.isConfirmed) {
        return;
      }
      try {
        await api.patch(`/admins/blocked/account/${account.id}`);
        account.status = "INACTIVE"; // Cập nhật trạng thái ngay lập tức
        this.$toast.success("Tài khoản đã bị block thành công");
      } catch (error) {
        this.$toast.error("Lỗi khi block tài khoản");
        console.error("Lỗi khi block tài khoản:", error);
      }
    },
    async unblockAccount(account) {
      try {
        await api.patch(`/admins/unblocked/account/${account.id}`);
        account.status = "ACTIVE"; // Cập nhật trạng thái ngay lập tức
        this.$toast.success("Tài khoản đã được mở khóa thành công");
      } catch (error) {
        this.$toast.error("Lỗi khi mở khóa tài khoản");
        console.error("Lỗi khi mở khóa tài khoản:", error);
      }
    },
    async deleteAccount(id) {
      const result = await Swal.fire({
        title: "Xác nhận xóa?",
        text: "Bạn có chắc chắn muốn xóa tài khoản này?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
      });

      if (!result.isConfirmed) {
        return;
      }
      try {
        await api.delete(`/admins/account/${id}`);
        this.$toast.success("Tài khoản đã bị xóa thành công");
        this.accounts = this.accounts.filter((account) => account.id !== id); // Xóa tài khoản ngay lập tức
      } catch (error) {
        this.$toast.error(
          error.response?.data?.message || "Lỗi khi xóa tài khoản"
        );
        console.error("Lỗi khi xóa tài khoản:", error);
      }
    },
    toggleIdVisibility(account) {
      account.showFullId = !account.showFullId;
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
  },
  mounted() {
    this.fetchAccounts();
  },
};
</script>
