<template>
  <div class="container mx-auto p-6 bg-gray-100 shadow-md rounded-lg">
    <h2 class="text-center text-blue-600 font-bold text-2xl mb-6">
      Quản lý Đơn Xét Duyệt
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-for="submission in submissions"
        :key="submission.submissionId"
        class="relative bg-white border border-blue-500 p-6 rounded-lg shadow-md transition-transform transform hover:-translate-y-1 hover:shadow-lg"
        @mouseover="showHoverCard(submission, $event)"
        @mouseleave="hideHoverCard"
      >
        <h4 class="text-center text-blue-600 font-bold text-lg uppercase mb-3">
          Đơn Xét Duyệt
        </h4>
        <hr class="border-t border-gray-300 my-3" />
        <div>
          <h4 class="font-bold">Tiêu đề: {{ submission.subSubject }}</h4>
          <p>
            <strong>Người tạo:</strong>
            <span
              @click="toggleCompanyInfo(submission)"
              class="text-blue-500 underline cursor-pointer"
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
            <strong>Hạn chót:</strong> {{ formatDate(submission.subDeadline) }}
          </p>
          <p><strong>Mô tả:</strong> {{ submission.subContent }}</p>
          <p v-if="submission.subSubject === 'Yêu Cầu Cập Nhật Giá Sự Kiện'">
            <strong>Nội dung:</strong> {{ submission.subFormdata }} VND
          </p>
        </div>
        <div class="flex gap-3 mt-4">
          <button
            v-if="
              submission.subStatus !== 'COMPLETED' &&
              submission.subSubject.trim() !==
                'Tường trình đề nghị phê duyệt sự kiện'
            "
            @click="reject(submission)"
            class="btn btn-danger hover:bg-red-600"
          >
            <i class="fas fa-times"></i> Hủy
          </button>

          <button
            v-else-if="submission.subStatus !== 'PENDING'"
            disabled
            class="flex-grow bg-blue-500 text-white py-2 px-4 rounded-lg cursor-not-allowed"
          >
            {{ submission.subStatus }}
          </button>
          <button
            v-else
            disabled
            class="flex-grow bg-yellow-500 text-white py-2 px-4 rounded-lg cursor-not-allowed"
          >
            {{ submission.subStatus }}
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="hoveredSubmission"
      class="absolute z-50 bg-white shadow-lg p-4 rounded-lg w-72"
      :style="{
        top: hoverPosition.top + 'px',
        left: hoverPosition.left + 'px',
      }"
    >
      <h4 class="font-bold text-gray-700">Sự kiện</h4>
      <h5 class="text-blue-600 font-bold">
        {{ hoveredSubmission.eventTitle }}
      </h5>
      <p><strong>ID:</strong> {{ hoveredSubmission.eventId }}</p>
      <p><strong>Trạng thái:</strong> {{ hoveredSubmission.eventStatus }}</p>
      <p><strong>Giá:</strong> {{ hoveredSubmission.eventPrice }} VND</p>
    </div>

    <div class="flex justify-between items-center mt-6">
      <button
        @click="prevPage"
        :disabled="currentPage === 1"
        class="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white disabled:opacity-50"
      >
        <i class="fas fa-chevron-left"></i> Trang trước
      </button>
      <span class="font-bold text-gray-700"
        >Trang {{ currentPage }} / {{ totalPages }}</span
      >
      <button
        @click="nextPage"
        :disabled="currentPage >= totalPages"
        class="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white disabled:opacity-50"
      >
        Trang sau <i class="fas fa-chevron-right"></i>
      </button>
    </div>
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
import { formatDate, formatCurrency } from "@/composable/format";
export default {
  data() {
    return {
      submissions: [],
      currentPage: 1,
      itemsPerPage: 4,
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
          `/submissions/company/${this.$route.params.companyId}?page=${
            this.currentPage - 1
          }&size=${this.itemsPerPage}`
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
   
    async reject(submission) {
      try {
        const res = await api.delete(
          `/submissions/${submission.submissionId}`
        );
        this.$toast.success(res.data.message || "Đã Hủy Đơn!");
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
