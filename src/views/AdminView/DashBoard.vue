<template>
  <div class="dashboard container">
    <h1 class="text-center mt-4">📊 Admin Dashboard</h1>

    <!-- Dòng đầu tiên: Báo cáo doanh thu & tài khoản -->
    <div class="row align-items-stretch">
      <div class="col-md-6">
        <div class="card report-card">
          <h2>💰 Báo Cáo Doanh Thu</h2>
          <div class="d-flex justify-content-around align-items-center flex-grow-1">
            <div class="report-box">
              <i class="fas fa-money-bill-wave text-success"></i>
              <p>Đã Thanh Toán</p>
              <h3>{{ totalPaidRevenue }}₫</h3>
            </div>
            <div class="report-box">
              <i class="fas fa-exclamation-circle text-warning"></i>
              <p>Chưa Thanh Toán</p>
              <h3>{{ totalUnpaidRevenue }}₫</h3>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card report-card">
          <h2>👤 Báo Cáo Tài Khoản</h2>
          <div class="d-flex justify-content-around align-items-center flex-grow-1">
            <div class="report-box">
              <i class="fas fa-users text-primary"></i>
              <p>Người dùng hoạt động</p>
              <h3>{{ userReportData.countedUser }}</h3>
            </div>
            <div class="report-box">
              <i class="fas fa-user-slash text-danger"></i>
              <p>Người dùng bị khóa</p>
              <h3>{{ userReportData.countedBlock }}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dòng 2: Doanh thu theo tháng -->
    <div class="row mt-4 align-items-stretch">
      <div class="col">
        <div class="card chart-card">
          <h2>📈 Doanh Thu Theo Tháng</h2>
          <div class="d-flex align-items-center mb-2">
            <label class="me-2">Chọn năm:</label>
            <select v-model="selectedYear" @change="fetchRevenueData" class="form-select w-auto">
              <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
            </select>
          </div>
          <apexchart type="line" :options="revenueChartOptions" :series="revenueChartData" height="350"></apexchart>
        </div>
      </div>
    </div>

    <!-- Dòng 3: Thống kê sự kiện & vé -->
    <div class="row mt-4 align-items-stretch">
      <div class="col-md-6">
        <div class="card chart-card">
          <h2>📊 Thống Kê Sự Kiện</h2>
          <p class="summary">Tổng số sự kiện: {{ eventData.totalEvent }}</p>
          <apexchart type="bar" :options="eventChartOptions" :series="eventChartData" height="300"></apexchart>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card chart-card">
          <h2>🎟️ Thống Kê Vé</h2>
          <p class="summary">Tổng số vé: {{ eventData.totalTicket }}</p>
          <apexchart type="donut" :options="ticketChartOptions" :series="ticketChartData" height="300"></apexchart>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: auto;
  padding: 20px;
}

.card {
  border-radius: 12px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  background: white;
}

.report-card {
  height: 200px;
}

.report-box {
  text-align: center;
}

.report-box i {
  font-size: 2rem;
  margin-bottom: 10px;
}

.chart-card {
  min-height: 350px;
}

.summary {
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;
  background-color: aqua;
}
</style>

  <script>
  import { availableYears } from "@/composable/availableYears";
  import { api } from "@/api/Api";
  import VueApexCharts from "vue3-apexcharts";

  export default {
    components: { apexchart: VueApexCharts },
    data() {
      return {
        selectedYear: new Date().getFullYear(),
        availableYears,
        revenueData: [],
        eventData: {},
        ticketData: {},
        userReportData: {},
      };
    },
    computed: {
      totalPaidRevenue() {
        return this.revenueData
          .filter((item) => item.ticketStatus === "PAID")
          .reduce((sum, item) => sum + item.totalPrice, 0)
          .toLocaleString();
      },
      totalUnpaidRevenue() {
        return this.revenueData
          .filter((item) => item.ticketStatus === "UNPAID")
          .reduce((sum, item) => sum + item.totalPrice, 0)
          .toLocaleString();
      },
      revenueChartData() {
        const months = [
          ...new Set(this.revenueData.map((item) => `Tháng ${item.month}`)),
        ];
        const paidData = months.map(
          (month) =>
            this.revenueData.find(
              (item) =>
                item.month === parseInt(month.replace("Tháng ", "")) &&
                item.ticketStatus === "PAID"
            )?.totalPrice || 0
        );
        const unpaidData = months.map(
          (month) =>
            this.revenueData.find(
              (item) =>
                item.month === parseInt(month.replace("Tháng ", "")) &&
                item.ticketStatus === "UNPAID"
            )?.totalPrice || 0
        );

        return [
          { name: "Vé đã thanh toán", data: paidData },
          { name: "Vé chưa thanh toán", data: unpaidData },
        ];
      },
      revenueChartOptions() {
        return {
          chart: { type: "line" },
          xaxis: {
            categories: this.revenueData.map((item) => `Tháng ${item.month}`),
          },
          colors: ["#4CAF50", "#FF9800"],
        };
      },
      eventChartData() {
        return [
          {
            name: "Sự kiện",
            data: [
              this.eventData.upcomingEvent || 0,
              this.eventData.awaitingApprovalEvent || 0,
              this.eventData.cancelledEvent || 0,
            ],
          },
        ];
      },
      eventChartOptions() {
        return {
          chart: { type: "bar" },
          xaxis: {
            categories: ["Sắp diễn ra", "Chờ duyệt", "Bị hủy"],
          },
          colors: ["#007BFF"],
        };
      },
      ticketChartData() {
        return [
          this.ticketData.paidTicket || 0,
          this.ticketData.unpaidTicket || 0,
        ];
      },
      ticketChartOptions() {
        return {
          labels: ["Vé đã thanh toán", "Vé chưa thanh toán"],
          colors: ["#28A745", "#DC3545"],
        };
      },
    },
    methods: {
      async fetchRevenueData() {
        try {
          const response = await api.get(
            `/reports/charts?year=${this.selectedYear}`
          );
          this.revenueData = response.data.data;
        } catch (error) {
          console.error("Lỗi khi lấy doanh thu:", error);
        }
      },
      async fetchEventData() {
        try {
          const response = await api.get("/reports/overview");
          this.eventData = response.data.data;
          this.ticketData = {
            paidTicket: response.data.data.paidTicket,
            unpaidTicket: response.data.data.unpaidTicket,
          };
        } catch (error) {
          console.error("Lỗi khi lấy thông tin sự kiện:", error);
        }
      },
      async fetchUserReport() {
        try {
          const response = await api.get("/admins/account/report");
          this.userReportData = response.data.data;
        } catch (error) {
          console.error("Lỗi khi lấy báo cáo tài khoản:", error);
        }
      },
    },
    mounted() {
      this.fetchRevenueData();
      this.fetchEventData();
      this.fetchUserReport();
    },
  };
  </script>
<!-- 
  <style scoped>
  .container {
    max-width: 1200px;
  }
  .card {
    border-radius: 10px;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  }
  .account-box {
    text-align: center;
    flex: 1;
  }
  .account-box i {
    font-size: 40px;
    margin-bottom: 10px;
  }
  .text-primary {
    color: #007bff !important;
  }
  .text-danger {
    color: #dc3545 !important;
  }
  .report-container {
    display: flex;
    gap: 20px;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .report-card {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
    position: relative;
    width: 48%;
  }

  .chart-container {
    height: 300px;
  }

  .summary-box {
    bottom: 10px;
    right: 20px;
    background: #007bff;
    color: white;
    padding: 5px 10px;
    border-radius: 5px;
    font-weight: bold;
  }

  .total-label {
    font-size: 14px;
  }

  .total-value {
    font-size: 18px;
  }

  .revenue-box {
    text-align: center;
    flex: 1;
  }
  .revenue-box i {
    font-size: 40px;
    margin-bottom: 10px;
  }
  .text-success {
    color: #28a745 !important;
  }
  .text-warning {
    color: #ffc107 !important;
  }

  </style> -->
