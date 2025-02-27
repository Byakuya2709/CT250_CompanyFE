<template>
  <div class="ticket-list">
    <h2>🎟️ Danh Sách Vé</h2>
    <div v-if="tickets.length" class="tickets-container">
      <div
        class="ticket-card"
        v-for="ticket in tickets"
        :key="ticket.ticketId"
        @click="goToTicket(ticket.ticketId)"
      >
        <div class="ticket-header">
          <span class="ticket-id">#{{ ticket.ticketId }}</span>
          <span
            class="ticket-status"
            :class="getStatusClass(ticket.ticketStatus)"
          >
            {{ ticket.ticketStatus }}
          </span>
        </div>
        <div class="ticket-body">
          <p>
            <strong>🎫 Giá:</strong>
            {{ ticket.ticketPrice.toLocaleString() }} VND
          </p>
          <p><strong>📍 Vị trí:</strong> {{ ticket.ticketPosition }}</p>
          <p>
            <strong>📅 Ngày hoạt động:</strong>
            {{ formatDate(ticket.ticketDayActive) }}
          </p>
        </div>
      </div>
    </div>
    <p v-else class="empty-message">Không có vé nào được tìm thấy.</p>
  </div>
</template>

<script>
import { api } from "@/api/Api";

export default {
  data() {
    return {
      tickets: [],
    };
  },
  mounted() {
    this.fetchTickets();
  },
  methods: {
    async fetchTickets() {
      try {
        const response = await api.get(
          `/tickets/${this.$route.params.companyId}`
        );
        if (response.data.status === "OK") {
          this.tickets = response.data.data;
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu vé:", error);
      }
    },
    goToTicket(ticketId) {
      this.$router.push(`/company/${ticketId}`);
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    },
    getStatusClass(status) {
      return {
        available: status === "Available",
        sold: status === "Sold",
        pending: status === "Pending",
      };
    },
  },
};
</script>

<style scoped>
.ticket-list {
  max-width: 800px;
  margin: 20px auto;
  text-align: center;
}

h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
}

.tickets-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: center;
}

.ticket-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  width: 300px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.ticket-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  margin-bottom: 10px;
}

.ticket-id {
  font-size: 18px;
  color: #444;
}

.ticket-status {
  padding: 5px 10px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: bold;
}

.available {
  background-color: #28a745;
  color: white;
}

.sold {
  background-color: #dc3545;
  color: white;
}

.pending {
  background-color: #ffc107;
  color: black;
}

.ticket-body {
  text-align: left;
  font-size: 14px;
}

.ticket-body p {
  margin: 5px 0;
}

.empty-message {
  font-size: 16px;
  color: #777;
}
</style>
