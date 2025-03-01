<template>
  <div class="container-fluid mt-4">
    <div class="row">
      <div class="col-md-3">
        <div class="card shadow-sm p-4 text-center">
          <font-awesome-icon icon="users" class="icon text-primary" />
          <h5 class="mt-2">Tổng tài khoản</h5>
          <h3 class="fw-bold">{{ countedUser }}</h3>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card shadow-sm p-4 text-center">
          <font-awesome-icon icon="user-slash" class="icon text-danger" />
          <h5 class="mt-2">Tài khoản bị khóa</h5>
          <h3 class="fw-bold">{{ countedBlock }}</h3>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card shadow-sm p-4 text-center">
          <font-awesome-icon icon="calendar-alt" class="icon text-warning" />
          <h5 class="mt-2">Tổng số sự kiện</h5>
          <h3 class="fw-bold">{{ reportData.totalEvent || 0 }}</h3>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card shadow-sm p-4 text-center">
          <font-awesome-icon icon="money-bill" class="icon text-success" />
          <h5 class="mt-2">Tổng doanh thu</h5>
          <h3 class="fw-bold">{{ reportData.totalRevenue || 0 }}</h3>
        </div>
      </div>
    </div>

    <!-- Biểu đồ -->
    <div class="row mt-4">
      <div class="col-md-6">
        <div class="card p-4">
          <h5 class="text-center">Thống kê sự kiện</h5>
          <v-chart class="chart" :option="eventChartOptions" autoresize />
        </div>
      </div>
      <div class="col-md-6">
        <div class="card p-4">
          <h5 class="text-center">Thống kê vé</h5>
          <apexchart
            class="chart"
            type="bar"
            :options="ticketChartOptions"
            :series="ticketSeries"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { api } from "@/api/Api";
import VChart from "vue-echarts";
import { use } from "echarts/core";
import { PieChart } from "echarts/charts";
import { CanvasRenderer } from "echarts/renderers";
import { TooltipComponent, LegendComponent } from "echarts/components";
import VueApexCharts from "vue3-apexcharts";

use([PieChart, CanvasRenderer, TooltipComponent, LegendComponent]);

export default {
  components: {
    VChart,
    apexchart: VueApexCharts,
  },
  data() {
    return {
      countedUser: 0,
      countedBlock: 0,
      reportData: {},
      eventChartOptions: {},
      ticketChartOptions: {},
      ticketSeries: [],
    };
  },
  methods: {
    async fetchReport() {
      try {
        const accountResponse = await api.get("/admins/account/report");
        const eventResponse = await api.get("/reports/admin");

        if (accountResponse.data.status === "OK") {
          this.countedUser = accountResponse.data.data.countedUser;
          this.countedBlock = accountResponse.data.data.countedBlock;
        }
        if (eventResponse.data.status === "OK") {
          this.reportData = eventResponse.data.data;
          this.setCharts();
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      }
    },
    setCharts() {
      // Biểu đồ sự kiện (Pie Chart)
      this.eventChartOptions = {
        tooltip: { trigger: "item" },
        legend: { top: "5%" },
        series: [
          {
            name: "Sự kiện",
            type: "pie",
            radius: "50%",
            data: [
              { value: this.reportData.totalEvent, name: "Tổng sự kiện" },
              { value: this.reportData.upcomingEvent, name: "Sắp tới" },
              { value: this.reportData.cancelledEvent, name: "Đã hủy" },
              {
                value: this.reportData.awaitingApprovalEvent,
                name: "Chờ duyệt",
              },
            ],
          },
        ],
      };

      // Biểu đồ vé (Bar Chart)
      const maxTicket =
        Math.ceil(
          Math.max(
            this.reportData.totalTicket || 0,
            this.reportData.paidTicket || 0,
            this.reportData.unpaidTicket || 0,
            this.reportData.canceledTicket || 0
          ) / 10
        ) * 10;

      this.ticketChartOptions = {
        chart: { type: "bar", toolbar: { show: false } },
        plotOptions: {
          bar: { horizontal: true, barHeight: "50%" },
        },
        xaxis: {
          categories: ["Tổng vé", "Đã thanh toán", "Chưa thanh toán", "Hủy bỏ"],
          tickAmount: Math.max(1, maxTicket / 10),
          labels: {
            formatter: (val) => `${val}`,
          },
        },
        yaxis: { labels: { show: true } },
        colors: ["#007bff", "#28a745", "#ffc107", "#dc3545"],
      };
      this.ticketSeries = [
        {
          name: "Số lượng vé",
          data: [
            this.reportData.totalTicket,
            this.reportData.paidTicket,
            this.reportData.unpaidTicket,
            this.reportData.canceledTicket,
          ],
        },
      ];
    },
  },
  mounted() {
    this.fetchReport();
  },
};
</script>

<style scoped>
.card {
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s;
  background: #ffffff;
}
.card:hover {
  transform: scale(1.02);
}
.icon {
  font-size: 2.5rem;
  margin-bottom: 10px;
}
.chart {
  width: 100%;
  height: 350px;
}
</style>
