<template>
  <div class="container mt-4 p-4 bg-white shadow rounded">
    <h2 class="text-center text-primary fw-bold mb-4">Quản lý Đơn xét duyệt</h2>
    <div class="row g-4">
      <div
        v-for="submission in submissions"
        :key="submission.submissionId"
        class="col-lg-6"
      >
        <div
          class="card shadow-sm p-3 border-0 rounded-3 submission-card"
          @mouseover="showHoverCard(submission, $event)"
          @mouseleave="hideHoverCard"
        >
          <div class="card-body">
            <h5 class="card-title text-primary fw-bold">
              {{ submission.subSubject }}
            </h5>
            <p class="card-text mb-2">
              <strong>Người tạo: </strong>
              <span
                @click="toggleCompanyInfo(submission)"
                class="text-decoration-underline text-info"
                style="cursor: pointer"
              >
                {{
                  submission.showCompanyId
                    ? submission.subCompanyId
                    : submission.subCompanyName
                }}
              </span>
            </p>
            <p class="card-text">
              <strong>Ngày tạo:</strong> {{ submission.subCreateDate }}
            </p>
            <p class="card-text">
              <strong>Hạn chót:</strong> {{ submission.subDeadline }}
            </p>
            <p class="card-text">
              <strong>Mô tả:</strong> {{ submission.subContent }}
            </p>
            <p
              v-if="submission.subSubject === 'Yêu Cầu Cập Nhật Giá Sự Kiện'"
              class="card-text"
            >
              <strong>Nội dung:</strong> {{ submission.subFormdata }} VND
            </p>

            <div class="d-flex gap-2 mt-3">
              <button
                v-if="submission.subStatus === 'PENDING'"
                @click="pass(submission)"
                class="btn btn-success flex-fill"
              >
                <i class="fas fa-check"></i> Duyệt
              </button>
              <button
                v-if="submission.subStatus === 'PENDING'"
                @click="reject(submission)"
                class="btn btn-danger flex-fill"
              >
                <i class="fas fa-times"></i> Từ chối
              </button>
              <button
                v-if="submission.subStatus !== 'PENDING'"
                disabled
                class="btn btn-warning flex-fill"
              >
                {{ submission.subStatus }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Card nổi khi hover -->
    <div
      v-if="hoveredSubmission"
      class="hover-card shadow p-3 bg-white rounded"
      :style="{
        top: hoverPosition.top + 'px',
        left: hoverPosition.left + 'px',
      }"
    >
      <h4>Sự kiện</h4>
      <h5 class="text-primary fw-bold">{{ hoveredSubmission.eventTitle }}</h5>
      <p><strong>Id:</strong> {{ hoveredSubmission.eventId }}</p>
      <p><strong>Trạng thái:</strong> {{ hoveredSubmission.eventStatus }}</p>
      <p><strong>Gía:</strong> {{ hoveredSubmission.eventPrice }} VND</p>
    </div>

    <!-- Phân trang -->
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
</template>
<style scoped>
.submission-card {
  transition: transform 0.2s, box-shadow 0.2s;
}
.submission-card:hover {
  transform: translateY(-5px);
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.15);
}
.hover-card {
  position: absolute;
  z-index: 1000;
  width: 250px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.2);
}
</style>

<script>
import { api } from "@/api/Api";

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
