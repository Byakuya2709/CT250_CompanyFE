<template>
  <div class="max-w-4xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4 text-center">
      📊 Quản Lý Đánh Giá Sự Kiện
    </h1>

    <!-- Bộ lọc -->
    <div class="flex flex-wrap gap-2 mb-4">
      <select v-model="filters.eventId" class="p-2 border rounded-lg" required>
        <option value="">Chọn sự kiện</option>
        <option
          v-for="event in events"
          :key="event.eventId"
          :value="event.eventId"
        >
          {{ event.eventTitle }}
        </option>
      </select>
      <button
        @click="applyFilters"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Lọc
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center text-gray-500 mt-4">Đang tải...</div>

    <!-- Lỗi -->
    <div v-else-if="error" class="text-red-500 mt-4">{{ error }}</div>

    <!-- Danh sách đánh giá -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="feedback in feedbacks"
        :key="feedback.fbId"
        class="p-6 border rounded-lg shadow-md bg-gray-50"
      >
        <h3 class="text-xl font-semibold text-gray-800 mb-2">
          Đánh giá từ vé số: {{ feedback.ticketId }}
        </h3>
        <div class="flex items-center mb-2">
          <span
            class="text-yellow-500 mr-1"
            v-for="i in feedback.fbRate"
            :key="i"
            >⭐</span
          >
          <span
            class="text-gray-500"
            v-for="i in 5 - feedback.fbRate"
            :key="`empty-${i}`"
            >☆</span
          >
        </div>

        <p class="text-gray-700">
          {{ feedback.fbContent }}
        </p>
        <p class="text-gray-600 text-sm mt-2">
          Ngày đánh giá:
          <span class="font-semibold">
            {{ formatDate(feedback.fbCreateDate) }}
          </span>
        </p>
      </div>
    </div>

    <!-- Phân trang -->
    <div v-if="totalPages > 1" class="flex justify-between items-center mt-6">
      <button
        @click="prevPage"
        :disabled="currentPage === 0"
        class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50"
      >
        Trang trước
      </button>
      <span class="text-gray-800 font-medium"
        >Trang {{ currentPage + 1 }} / {{ totalPages }}</span
      >
      <button
        @click="nextPage"
        :disabled="currentPage >= totalPages - 1"
        class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg"
      >
        Trang sau
      </button>
    </div>
  </div>
</template>

<script>
import { api } from "@/api/Api";
import { format } from "date-fns";

export default {
  data() {
    return {
      feedbacks: [],
      loading: false,
      error: null,
      currentPage: 0,
      totalPages: 1,
      filters: {
        eventId: "",
        companyId: this.$route.params.companyId,
      },
      events: [],
      size: 10,
    };
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return "Chưa xác định";
      return format(new Date(dateString), "dd/MM/yyyy HH:mm");
    },
    async fetchEvents() {
      try {
        const response = await api.get(
          `/events/company/${this.$route.params.companyId}/filter`
        );
        this.events = response.data.data;
      } catch (error) {
        this.$toast.error(
          error.response?.data?.message || "Lỗi khi tải danh sách sự kiện"
        );
      }
    },
    async fetchFeedbacks(page = 0) {
      this.loading = true;
      this.error = null;
      try {
        const params = {
          page: page,
          size: this.size,
        };

        if (this.filters.eventId) {
          const response = await api.get(
            `/blogs/feedbacks/event/${this.filters.eventId}`,
            { params }
          );
          this.feedbacks = response.data.data.content;
          this.currentPage = response.data.data.number;
          this.totalPages = response.data.data.totalPages;
        } else {
          this.feedbacks = [];
          this.currentPage = 0;
          this.totalPages = 1;
        }
      } catch (err) {
        this.error = err.response?.data?.message || "Lỗi khi tải đánh giá";
        this.$toast.error(this.error);
      } finally {
        this.loading = false;
      }
    },
    applyFilters() {
      this.fetchFeedbacks(0);
    },
    prevPage() {
      if (this.currentPage > 0) {
        this.currentPage--;
        this.fetchFeedbacks(this.currentPage);
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages - 1) {
        this.currentPage++;
        this.fetchFeedbacks(this.currentPage);
      }
    },
  },
  mounted() {
    this.fetchEvents();
    this.fetchFeedbacks();
  },
};
</script>

<style scoped></style>
