<template>
  <div class="eventList container mx-auto p-6">
    <h1 class="text-2xl font-bold text-center mb-6">Quản lý Sự Kiện</h1>

    <!-- Phần lọc sự kiện -->
    <div class="mb-6 p-4 bg-white rounded-lg shadow-sm">
      <!-- Dòng đầu tiên của bộ lọc -->
      <div class="flex space-x-4 mb-4">
        <div class="flex-1">
          <label
            for="eventStatus"
            class="block text-sm font-medium text-gray-700"
            >Trạng thái:</label
          >
          <select
            id="eventStatus"
            v-model="filters.eventStatus"
            class="block w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Tất cả</option>
            <option value="UP_COMMING">Sắp Diễn Ra</option>
            <option value="CANCELLED">Đã Hủy</option>
            <option value="AWAITING_APPROVAL">Đang Chờ Phê Duyệt</option>
            <option value="ENDED">Đã Kết Thúc</option>
          </select>
        </div>
      </div>

      <!-- Dòng thứ hai của bộ lọc -->
      <div class="flex space-x-4">
        <div class="flex-1">
          <label for="month" class="block text-sm font-medium text-gray-700"
            >Tháng:</label
          >
          <select
            v-model="filters.month"
            id="month"
            class="block w-full p-2 border rounded text-gray-700 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Tất cả</option>
            <option v-for="month in months" :key="month" :value="month">
              {{ month }}
            </option>
          </select>
        </div>
        <div class="flex-1">
          <label for="year" class="block text-sm font-medium text-gray-700"
            >Năm:</label
          >
          <select
            v-model="filters.year"
            id="year"
            class="block w-full p-2 border rounded text-gray-700 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Tất cả</option>
            <option v-for="year in availableYears" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </div>
      </div>

      <div class="flex space-x-2 mt-4">
        <button
          @click="applyFilters"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Áp dụng
        </button>
        <button
          @click="clearFilters"
          class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Xóa
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center text-gray-500">
      Loading events...
    </div>

    <div v-if="events.length > 0">
      <div
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      >
        <div
          v-for="event in paginatedAccounts"
          :key="event.eventId"
          @click="goToEventDetails(event.eventId)"
          class="bg-white shadow-lg rounded-lg overflow-hidden p-4 transition transform hover:scale-105 cursor-pointer"
        >
          <h3 class="text-lg font-semibold mb-2">{{ event.eventTitle }}</h3>
          <p class="text-gray-600 mb-2 event-description">
            {{ event.eventDescription }}
          </p>
          <p class="text-sm">
            <strong>Ngày Bắt đầu:</strong>
            {{ formatDate(event.eventStartDate) }}
          </p>
          <p class="text-sm">
            <strong>Ngày Kết Thúc:</strong> {{ formatDate(event.eventEndDate) }}
          </p>
          <p class="text-sm">
            <strong>Giá:</strong> {{ formatCurrency(event.eventPrice) }}
          </p>
          <p class="text-sm">
            <strong>Trạng thái:</strong> {{ event.eventStatus }}
          </p>
          <div class="flex items-center mt-2 text-yellow-500">
            <span
              v-for="index in getStars(event).fullStars"
              :key="'full-' + index"
              class="text-xl"
            >
              ★
            </span>
            <span v-if="getStars(event).halfStars" class="text-xl">★</span>
            <span
              v-for="index in getStars(event).emptyStars"
              :key="'empty-' + index"
              class="text-xl text-gray-300"
            >
              ★
            </span>
          </div>
          <img
            :src="getPosterImage(event.eventListImgURL)"
            alt="Event Image"
            class="w-full h-40 object-cover mt-3 rounded-md"
          />
        </div>
      </div>

      <div class="flex justify-between items-center mt-6">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          <i class="fas fa-chevron-left"></i> Trang trước
        </button>
        <span class="font-semibold"
          >Trang {{ currentPage }} / {{ totalPages }}</span
        >
        <button
          @click="nextPage"
          :disabled="currentPage >= totalPages"
          class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          Trang sau <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <div v-if="events.length === 0" class="text-center text-gray-500 mt-6">
      No events found.
    </div>
  </div>
</template>

<script>
import { api } from "@/api/Api";
import { formatCurrency } from "@/composable/format";
import { availableYears } from "@/composable/availableYears";
import { months } from "@/composable/months";

export default {
  data() {
    return {
      events: [], // Store events data
      loading: false, // Loading flag
      currentPage: 1,
      itemsPerPage: 8,
      totalPages: 1,
      totalElements: 0,
      availableYears,
      months,
      filters: {
        eventStatus: "", // Trạng thái sự kiện
        year: "",
        month: "",
      },
    };
  },
  mounted() {
    // this.getEvents();
  },
  computed: {
    paginatedAccounts() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.events;
    },
  },
  methods: {
    formatCurrency,
    getPosterImage(imgURLs) {
      return imgURLs.find((url) => url.includes("poster.jpg")) || imgURLs[0];
    },
    async getEvents() {
      this.loading = true;
      const { eventStatus, year, month } = this.filters;
      try {
        const response = await api.get(
          `/events/filter?page=${this.currentPage - 1}&companyId=${
            this.$route.params.companyId
          }&size=${
            this.itemsPerPage
          }&eventStatus=${eventStatus}&month=${month}&year=${year}`
        );

        if (response.data.status === "OK") {
          this.events = response.data.data.content;
          console.log(this.events);
          this.totalPages = response.data.data.totalPages;
        } else {
          this.$toast.error("Error fetching events");
          console.error("Error fetching events:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        this.$toast.error("Error fetching events");
      } finally {
        this.loading = false;
      }
    },
    applyFilters() {
      this.currentPage = 1; // Reset to first page when filters are applied
      this.getEvents();
    },
    clearFilters() {
      this.filters.companyId = "";
      this.filters.eventStatus = "";
      this.filters.year = "";
      this.filters.month = "";
      this.applyFilters();
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleString();
    },
    calculateAverageRating(event) {
      let totalReviews = 0;
      let weightedSum = 0;
      for (let star in event.eventRatingStart) {
        let count = event.eventRatingStart[star];
        weightedSum += star * count;
        totalReviews += count;
      }
      return totalReviews === 0 ? 0 : weightedSum / totalReviews;
    },
    getStars(event) {
      const averageRating = this.calculateAverageRating(event);
      const fullStars = Math.floor(averageRating);
      const halfStars = averageRating % 1 >= 0.5 ? 1 : 0;
      const emptyStars = 5 - fullStars - halfStars;

      return {
        fullStars,
        halfStars,
        emptyStars,
      };
    },
    goToEventDetails(eventId) {
      this.$router.push({ path: `/company/events/${eventId}` });
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.getEvents();
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.getEvents();
      }
    },
  },
};
</script>

<style scoped>
/* Tổng thể */
body {
  font-family: "Roboto", sans-serif;
  background-color: #f7f8fa;
  margin: 0;
  padding: 0;
}

/* Thẻ sự kiện */
.event {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-right: 20px; /* Thêm margin phải để có khoảng cách giữa các thẻ */
  margin-bottom: 20px;
  transition: all 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
  max-width: 300px; /* Giới hạn chiều rộng tối đa */
  width: 100%;
}

.event:hover {
  transform: translateY(-10px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}
.event-description {
  display: -webkit-box;
  -webkit-line-clamp: 3; /* Hiển thị tối đa 3 dòng */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis; /* Hiển thị dấu "..." nếu quá dài */
  max-width: 100%;
}
.event h3 {
  font-size: 1.6rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.event p {
  font-size: 1rem;
  color: #666;
  line-height: 1.5;
}

.event img {
  width: 100%;
  height: auto;
  border-radius: 8px;
  margin-top: 15px;
  transition: transform 0.3s ease-in-out;
}

.event img:hover {
  transform: scale(1.05);
}
.event-description {
  display: -webkit-box;
  /* -webkit-line-clamp: 3; Hiển thị tối đa 3 dòng */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis; /* Hiển thị dấu "..." nếu quá dài */
  max-width: 100%;
}

/* Đánh giá sao */
.stars {
  margin-top: 10px;
  display: flex;
  align-items: center;
}

.star {
  font-size: 20px;
  color: #ffcc00;
  margin-right: 3px;
}

.full-star {
  color: #ffcc00;
}

.half-star {
  position: relative;
}

.empty-star {
  color: #e0e0e0;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.pagination button {
  background-color: #ff6347;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s, transform 0.3s ease;
  margin: 0 8px;
}

.pagination button:hover {
  background-color: #ff4500;
  transform: scale(1.05);
}

.pagination button:disabled {
  background-color: #ddd;
  cursor: not-allowed;
}

.pagination span {
  padding: 10px;
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

/* Thiết kế cấu trúc trang (chuyển sang layout ngang) */
.event-list {
  display: flex;
  flex-wrap: wrap; /* Allow wrapping for small screens */
  gap: 20px;
  justify-content: flex-start;
}

.event {
  width: 280px; /* Điều chỉnh lại chiều rộng của các sự kiện */
}

/* Pagination control should be aligned with the horizontal layout */
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* Trang tải và không có sự kiện */
.loading {
  text-align: center;
  font-size: 1.2rem;
  color: #ff6347;
  margin-top: 30px;
}

.no-events {
  text-align: center;
  font-size: 1.2rem;
  color: #ff6347;
  font-weight: bold;
  margin-top: 30px;
}

/* Responsive design */
@media (max-width: 768px) {
  .event-list {
    flex-direction: column; /* Chuyển sang dọc khi màn hình nhỏ */
    align-items: center;
  }

  .pagination {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .event {
    width: 100%; /* Thẻ sự kiện chiếm toàn bộ chiều rộng */
    margin-bottom: 20px;
  }

  .pagination button {
    padding: 8px 15px;
  }
}
</style>
