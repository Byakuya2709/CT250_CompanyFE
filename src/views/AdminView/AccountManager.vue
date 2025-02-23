<template>
  <div class="container mt-4 p-4 bg-white shadow rounded">
    <h2 class="text-center text-primary fw-bold mb-4">Quản lý tài khoản</h2>
    <div class="table-responsive">
      <table class="table table-bordered table-hover text-center">
        <thead class="table-primary">
          <tr>
            <th>Email</th>
            <th>Loại</th>
            <th>Trạng thái</th>
            <th>ID</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="account in accounts" :key="account.id">
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
              {{
                account.showFullId ? account.id : account.id.slice(0, 6) + "..."
              }}
              <button
                @click="toggleIdVisibility(account)"
                class="btn btn-sm btn-info ms-2"
              >
                <i class="fas fa-eye"></i>
                {{ account.showFullId ? "Ẩn" : "Hiện" }}
              </button>
            </td>
            <td>
              <button
                v-if="account.status === 'ACTIVE'"
                @click="blockAccount(account)"
                class="btn btn-warning btn-sm me-2"
              >
                <i class="fas fa-ban"></i> Block
              </button>
              <button
                v-if="account.status === 'INACTIVE'"
                @click="unblockAccount(account)"
                class="btn btn-success btn-sm me-2"
              >
                <i class="fas fa-unlock"></i> Unblock
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
      <div class="d-flex justify-content-between mt-3">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="btn btn-primary"
        >
          Trang trước
        </button>
        <span>Trang {{ currentPage }} / {{ totalPages }}</span>
        <button
          @click="nextPage"
          :disabled="currentPage >= totalPages"
          class="btn btn-primary"
        >
          Trang sau
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
</style>
<script>
import { api } from "@/api/Api";
import Swal from "sweetalert2";
export default {
  data() {
    return {
      accounts: [],
      currentPage: 1,
      itemsPerPage: 2,
      totalPages: 1,
      totalElements: 0,
    };
  },
  computed: {
    paginatedAccounts() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.accounts.slice(start, end);
    },
  },
  methods: {
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
