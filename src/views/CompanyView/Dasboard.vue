<script>
import { api } from "@/api/Api";
import VueApexCharts from "vue3-apexcharts";

export default {
  components: { VueApexCharts },
  data() {
    return {
      eventCountByStatus: {},
      totalTicketPriceByStatus: {},
      events: [], // Danh sách sự kiện
      currentPage: 1, // Trang hiện tại
      pageSize: 10, // Số sự kiện mỗi trang
      totalEvents: 0, // Tổng số sự kiện
      totalPages: 0, // Tổng số trang
      chartOptions: {
        chart: { type: "bar" }, // Đổi thành biểu đồ cột
        xaxis: { categories: [] },
        title: { text: "Thống kê doanh thu sự kiện" },
        plotOptions: {
          bar: {
            horizontal: false, // Dữ liệu biểu đồ cột dọc
            columnWidth: "50%", // Điều chỉnh độ rộng cột
          },
        },
      },
      series: [], // Dữ liệu cho biểu đồ
    };
  },
  methods: {
    async fetchTotalTicketPriceByStatus() {
      try {
        const response = await api.get(
          `/reports/${this.$route.params.companyId}`
        );
        const data = response.data.data;
        this.eventCountByStatus = data.eventCountByStatus;
        this.totalTicketPriceByStatus = data.totalTicketPriceByStatus;
      } catch (error) {
        this.$toast.error(
          error.response?.data?.message || "Không thể kết nối đến hệ thống."
        );
      }
    },
    async fetchData() {
      try {
        const response = await api.get(
          `/events/${this.$route.params.companyId}/statistic`,
          {
            params: {
              page: this.currentPage - 1, // Giảm trang đi 1 vì API thường tính từ trang 0
              size: this.pageSize,
            },
          }
        );

        const data = response.data.data; // Lấy dữ liệu từ API
        this.events = data.content; // Lấy danh sách sự kiện
        this.totalEvents = data.totalElements; // Tổng số sự kiện
        this.totalPages = data.totalPages; // Tổng số trang

        // Cập nhật categories cho trục x là tên sự kiện
        this.chartOptions.xaxis.categories = this.events.map(
          (event) => event.eventTitle
        );

        this.chartOptions = {
          chart: {
            type: "bar", // Biểu đồ cột
          },
          xaxis: {
            categories: this.events.map((event) => event.eventTitle), // Đảm bảo rằng categories là tên sự kiện
            title: {
              text: "Tên sự kiện", // Tiêu đề trục hoành
            },
          },
          title: {
            text: "Thống kê doanh thu sự kiện",
          },
          plotOptions: {
            bar: {
              horizontal: false, // Biểu đồ cột dọc
              columnWidth: "50%", // Điều chỉnh độ rộng cột
            },
          },
        };

        // Cập nhật dữ liệu cho biểu đồ: mảng các doanh thu của tất cả sự kiện
        this.series = [
          {
            name: "Doanh thu", // Tên của series
            data: this.events.map((event) => event.totalRevenue), // Mảng các giá trị doanh thu
          },
        ];
      } catch (error) {
        this.$toast.error(
          error.response?.data?.message || "Không thể kết nối đến hệ thống."
        );
      }
    },

    handlePageChange(pageNumber) {
      this.currentPage = pageNumber;
      this.fetchData(); // Re-fetch the data with the updated page number
    },
  },

  mounted() {
    this.fetchData();
    this.fetchTotalTicketPriceByStatus();
  },
};
</script>

<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Card for Event Count by Status -->
      <div class="bg-white rounded-lg shadow-lg overflow-hidden">
        <div class="p-6 border-b border-gray-200 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          <h5 class="ml-3 text-lg font-semibold text-gray-800">
            Tổng số sự kiện
          </h5>
        </div>
        <div class="p-6 space-y-4">
          <ul
            v-if="
              eventCountByStatus && Object.keys(eventCountByStatus).length > 0
            "
          >
            <li
              v-for="(value, key) in eventCountByStatus"
              :key="key"
              class="flex items-center justify-between"
            >
              <div class="flex items-center space-x-2">
                <span class="font-medium text-gray-700">{{ key }}:</span>
                <span class="text-sm text-gray-500">{{ value }}</span>
              </div>
              <!-- Badge for Event Status -->
            </li>
          </ul>
          <p v-else class="text-center text-gray-500">No data available</p>
        </div>
      </div>

      <!-- Card for Total Ticket Price by Status -->
      <div class="bg-white rounded-lg shadow-lg overflow-hidden">
        <div class="p-6 border-b border-gray-200 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 8l7 7 7-7"
            />
          </svg>
          <h5 class="ml-3 text-lg font-semibold text-gray-800">Tổng số vé</h5>
        </div>
        <div class="p-6 space-y-4">
          <ul
            v-if="
              totalTicketPriceByStatus &&
              Object.keys(totalTicketPriceByStatus).length > 0
            "
          >
            <li
              v-for="(value, key) in totalTicketPriceByStatus"
              :key="key"
              class="flex items-center justify-between"
            >
              <div class="flex items-center space-x-2">
                <span class="font-medium text-gray-700">{{ key }}:</span>
                <span class="text-sm text-gray-500">{{ value }}</span>
              </div>
              <!-- Colored Label for Ticket Status -->
              <span
                :class="{
                  'bg-blue-100 text-blue-800': key === 'PAID',
                  'bg-red-100 text-red-800': key === 'UNPAID',
                }"
                class="px-2 py-1 text-xs font-semibold rounded-full"
              >
                {{ key }}
              </span>
            </li>
          </ul>
          <p v-else class="text-center text-gray-500">No data available</p>
        </div>
      </div>
    </div>

    <h1 class="text-2xl font-bold mb-4">Dashboard Thống Kê Sự Kiện</h1>

    <!-- Biểu đồ doanh thu -->
    <div class="bg-white p-4 rounded-lg shadow mb-6">
      <VueApexCharts
        type="bar"
        height="350"
        :options="chartOptions"
        :series="series"
      />
    </div>

    <!-- Bảng danh sách sự kiện -->
    <div class="bg-white p-4 rounded-lg shadow mb-6">
      <table class="w-full border-collapse border border-gray-300">
        <thead>
          <tr class="bg-gray-200">
            <th class="border p-2">Tên sự kiện</th>
            <th class="border p-2">Giá vé</th>
            <th class="border p-2">Tổng vé</th>
            <!-- <th class="border p-2">Doanh thu</th> -->
            <th class="border p-2">Vé đã thanh toán</th>
            <th class="border p-2">Vé chưa thanh toán</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="event in events" :key="event.eventId" class="text-center">
            <td class="border p-2">{{ event.eventTitle }}</td>
            <td class="border p-2">
              {{ event.eventPrice.toLocaleString() }} VND
            </td>
            <td class="border p-2">{{ event.totalTickets }}</td>
            <!-- <td class="border p-2">
              {{ event.totalRevenue.toLocaleString() }} VND
            </td> -->
            <td class="border p-2">{{ event.paidTickets }}</td>
            <td class="border p-2">{{ event.unpaidTickets }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Phân trang -->
    <div class="flex justify-center mt-4">
      <button
        v-if="currentPage > 1"
        @click="handlePageChange(currentPage - 1)"
        class="px-4 py-2 bg-blue-500 text-white rounded-md"
      >
        Previous
      </button>

      <span class="mx-4 self-center">{{ currentPage }} / {{ totalPages }}</span>

      <button
        v-if="currentPage < totalPages"
        @click="handlePageChange(currentPage + 1)"
        class="px-4 py-2 bg-blue-500 text-white rounded-md"
      >
        Next
      </button>
    </div>
  </div>
</template>
