<template>
  <div class="container mt-4 p-4 bg-light shadow-sm rounded">
    <h2 class="text-center text-primary fw-bold mb-4">Quản lý Đơn Xét Duyệt</h2>
    <div class="row g-4">
      <div
        v-for="submission in submissions"
        :key="submission.submissionId"
        class="col-lg-6"
      >
        <div
          class="approval-form border p-4 rounded shadow position-relative"
          @mouseover="showHoverCard(submission, $event)"
          @mouseleave="hideHoverCard"
        >
          <h4 class="text-center text-uppercase fw-bold text-primary mb-3">
            Đơn Xét Duyệt
          </h4>
          <hr />
          <div class="form-content">
            <h4 style="font-style: bold">
              <strong>Tiêu đề:</strong> {{ submission.subSubject }}
            </h4>
            <p>
              <strong>Người tạo:</strong>
              <span
                @click="toggleCompanyInfo(submission)"
                class="text-decoration-underline text-info cursor-pointer"
              >
                {{
                  submission.showCompanyId
                    ? submission.subCompanyId
                    : submission.subCompanyName
                }}
              </span>
            </p>
            <p>
              <strong>Ngày tạo:</strong>
              {{ formatDate(submission.subCreateDate) }}
            </p>
            <p>
              <strong>Hạn chót:</strong>
              {{ formatDate(submission.subDeadline) }}
            </p>
            <p><strong>Mô tả:</strong> {{ submission.subContent }}</p>
            <p v-if="submission.subSubject === 'Yêu Cầu Cập Nhật Giá Sự Kiện'">
              <strong>Nội dung:</strong> {{ submission.subFormdata }} VND
            </p>
          </div>
          <div class="d-flex gap-3 mt-4">
            <button
              v-if="submission.subStatus === 'PENDING'"
              @click="pass(submission)"
              class="btn btn-success flex-grow-1"
            >
              <i class="fas fa-check"></i> Duyệt
            </button>
            <button
              v-if="submission.subStatus === 'PENDING'"
              @click="reject(submission)"
              class="btn btn-danger flex-grow-1"
            >
              <i class="fas fa-times"></i> Từ chối
            </button>
            <button
              v-if="submission.subStatus !== 'PENDING'"
              disabled
              class="btn btn-warning flex-grow-1"
            >
              {{ submission.subStatus }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Card nổi khi hover -->
    <div
      v-if="hoveredSubmission"
      class="hover-card shadow-lg bg-white p-3 rounded-3"
      :style="{
        top: hoverPosition.top + 'px',
        left: hoverPosition.left + 'px',
      }"
    >
      <h4 class="fw-bold text-dark">Sự kiện</h4>
      <h5 class="text-primary fw-bold">{{ hoveredSubmission.eventTitle }}</h5>
      <p><strong>ID:</strong> {{ hoveredSubmission.eventId }}</p>
      <p><strong>Trạng thái:</strong> {{ hoveredSubmission.eventStatus }}</p>
      <p><strong>Giá:</strong> {{ hoveredSubmission.eventPrice }} VND</p>
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
</template>

<style scoped>
.approval-form {
  background: #fff;
  border: 2px solid #007bff;
  border-radius: 12px;
  transition: all 0.3s ease-in-out;
  position: relative;
}
.approval-form:hover {
  transform: translateY(-3px);
  box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.2);
}
.cursor-pointer {
  cursor: pointer;
}
.hover-card {
  position: absolute;
  z-index: 1050;
  width: 280px;
  box-shadow: 0px 6px 14px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  background-color: #ffffff;
  padding: 15px;
}
</style>

<script>
import { api } from "@/api/Api";
import { formatDate, formatCurrency } from "@/composable/format"
export default {
  data() {
    return {
      submissions: [],
      currentPage: 1,
      itemsPerPage: 5,
      totalPages: 1,

      hoveredSubmission: null,
      hoverPosition: { top: 0, left: 0 },
    };
  },
  methods: {
    formatDate,
    formatCurrency,
    async fetchSubmissions() {
      try {
        const response = await api.get(
          `/submissions?page=${this.currentPage - 1}&size=${this.itemsPerPage}`
        );
        this.submissions = response.data.data.content.map((submission) => ({
          ...submission,
          showCompanyId: false,
        }));
        this.totalPages = response.data.data.totalPages;
      } catch (error) {
        this.$toast.error(
          error.response?.data?.message || "Lỗi khi lấy danh sách tài khoản"
        );
        console.error("Lỗi khi lấy danh sách tài khoản:", error);
      }
    },
    toggleCompanyInfo(submission) {
      submission.showCompanyId = !submission.showCompanyId;
    },
    async pass(submission) {
      try {
        const res = await api.put(
          `/submissions/${submission.submissionId}/confirm/approved`
        );
        this.$toast.success(res.data.message || "Đã duyệt đơn!");
        this.fetchSubmissions();
      } catch (error) {
        this.$toast.error(
          error.response?.data?.message || "Error approve submission"
        );
        console.error(error);
      }
    },
    async reject(submission) {
      try {
        const res = await api.put(
          `/submissions/${submission.submissionId}/confirm/rejected`
        );
        this.$toast.success(res.data.message || "Đã từ chối đơn!");
        this.fetchSubmissions();
      } catch (error) {
        this.$toast.error(
          error.response?.data?.message || "Error declined submission"
        );
        console.error(error);
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.fetchSubmissions();
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.fetchSubmissions();
      }
    },
    showHoverCard(submission, event) {
      this.hoveredSubmission = submission;
      this.hoverPosition = {
        top: event.clientY + window.scrollY + 10, // Hiển thị ngay phía dưới con trỏ
        left: event.clientX + 10,
      };
    },
    hideHoverCard() {
      this.hoveredSubmission = null;
    },
  },
  mounted() {
    this.fetchSubmissions();
  },
};
</script>
