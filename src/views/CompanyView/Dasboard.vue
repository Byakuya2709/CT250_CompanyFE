<template>
  <div class="container mt-4">
    <h1 class="mb-4 text-primary">📊 Dashboard Thống Kê Sự Kiện</h1>

    <!-- Nút tải Excel -->
    <button @click="exportToExcel" class="btn btn-success mb-3">
      📥 Xuất Excel
    </button>

    <!-- Kiểm tra lỗi -->
    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>

    <!-- Hiển thị bảng sự kiện -->
    <div v-if="!loading">
      <table class="table table-striped table-bordered">
        <thead class="table-dark">
          <tr>
            <th>ID</th>
            <th>Tên Sự Kiện</th>
            <th>Số Vé</th>
            <th>Doanh Thu (VND)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="event in eventStats" :key="event.eventId">
            <td>{{ event.eventId }}</td>
            <td>{{ event.eventTitle }}</td>
            <td>{{ event.totalTickets }}</td>
            <td>{{ event.totalRevenue.toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Biểu đồ doanh thu -->
      <div class="row">
        <div class="col-md-6">
          <div class="card p-3">
            <h5>📈 Biểu Đồ Doanh Thu</h5>
            <Bar v-if="chartData.labels.length > 0" :data="chartData" />
          </div>
        </div>
        <div class="col-md-6">
          <div class="card p-3">
            <h5>📊 Tỷ Lệ Doanh Thu</h5>
            <Pie v-if="chartData.labels.length > 0" :data="chartData" />
          </div>
        </div>
      </div>
      <div class="row mt-3">
        <div class="col-md-6">
          <div class="card p-3">
            <h5>📉 Xu Hướng Doanh Thu</h5>
            <Line v-if="chartData.labels.length > 0" :data="chartData" />
          </div>
        </div>
        <div class="col-md-6">
          <div class="card p-3">
            <h5>📊 So Sánh Doanh Thu</h5>
            <Bar
              v-if="chartData.labels.length > 0"
              :data="horizontalChartData"
              :options="horizontalOptions"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as XLSX from "xlsx";
import { Bar, Pie, Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PieController,
  ArcElement,
  LineElement,
  PointElement,
} from "chart.js";
import { api } from "@/api/Api";

// Đăng ký các thành phần cần thiết của Chart.js
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PieController,
  ArcElement,
  LineElement,
  PointElement
);

export default {
  components: { Bar, Pie, Line },
  data() {
    return {
      eventStats: [],
      loading: true,
      errorMessage: "",
      chartData: {
        labels: [],
        datasets: [
          {
            label: "Doanh Thu",
            data: [],
            backgroundColor: "#007bff",
          },
        ],
      },
      horizontalChartData: {
        labels: [],
        datasets: [
          {
            label: "Doanh Thu",
            data: [],
            backgroundColor: "#28a745",
          },
        ],
      },
      horizontalOptions: {
        indexAxis: "y",
      },
    };
  },
  methods: {
    async fetchEventStats() {
      try {
        const response = await api.get(
          `/events/${this.$route.params.companyId}/statistic`
        );
        console.log("API Response:", response.data);

        this.eventStats = response.data.data || [];
        this.updateChartData();
      } catch (error) {
        console.error("API Error:", error);
        this.$toast.error("Lỗi tải dữ liệu từ server!", {
          position: "top-right",
        });
      } finally {
        this.loading = false;
      }
    },
    updateChartData() {
      this.chartData.labels = this.eventStats.map(
        (event) => event.eventTitle || "Chưa có tên"
      );
      this.chartData.datasets[0].data = this.eventStats.map(
        (event) => event.totalRevenue || 0
      );

      this.horizontalChartData.labels = [...this.chartData.labels];
      this.horizontalChartData.datasets[0].data = [
        ...this.chartData.datasets[0].data,
      ];
    },
    exportToExcel() {
      try {
        const ws = XLSX.utils.json_to_sheet(this.eventStats);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Event Stats");
        XLSX.writeFile(wb, "Event_Statistics.xlsx");
        this.$toast.success("📥 Xuất file Excel thành công!", {
          position: "top-right",
        });
      } catch (error) {
        this.$toast.error("❌ Lỗi khi xuất file Excel!", {
          position: "top-right",
        });
        console.error("Excel Export Error:", error);
      }
    },
  },
  created() {
    this.fetchEventStats();
  },
};
</script>

<style>
.container {
  max-width: 900px;
}
</style>
