<script>
import { api } from "@/api/Api";

export default {
  data() {
    return {
      tickets: [],
      events: [],
      totalPages: 1,
      currentPage: 0,
      loading: false,
      filters: {
        eventId: "",
        status: "",
        userEmail: "",
      },
    };
  },
  methods: {
    async fetchTickets(page = 0) {
      this.loading = true;
      try {
        const params = new URLSearchParams({ page, size: 10 });
        if (this.filters.eventId)
          params.append("eventId", this.filters.eventId);
        if (this.filters.status) params.append("status", this.filters.status);
        if (this.filters.userEmail)
          params.append("userEmail", this.filters.userEmail);

        const response = await api.get(`/events/tickets?${params.toString()}`);
        this.tickets = response.data.content;
        this.totalPages = response.data.totalPages;
        this.currentPage = response.data.pageable.pageNumber;
      } catch (error) {
        console.error("Error fetching tickets:", error);
      } finally {
        this.loading = false;
      }
    },
    async deleteTicket(ticketId) {
      try {
        await api.delete(`/tickets/${ticketId}`);
        this.$toast.success("Xóa vé thành công.");

        // Cập nhật danh sách vé
        this.tickets = this.tickets.filter(
          (ticket) => ticket.ticketId !== ticketId
        );
      } catch (error) {
        this.$toast.error(error.response?.data?.message || "Đã xảy ra lỗi.");
      }
    },
    async fetchEvents() {
      try {
        const response = await api.get(
          `/events/company/${this.$route.params.companyId}/filter`
        );
        this.events = response.data.data;
        console.log(this.events);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    },
    applyFilters() {
      this.fetchTickets(0);
    },
    clearFilters() {
      this.filters.eventId = "";
      this.filters.status = "";
      this.filters.userEmail = "";
    },
    changePage(newPage) {
      if (newPage >= 0 && newPage < this.totalPages) {
        this.fetchTickets(newPage);
      }
    },
  },
  mounted() {
    // this.fetchTickets();
    this.fetchEvents();
  },
};
</script>

<template>
  <div class="p-6 max-w-6xl mx-auto bg-white shadow-md rounded-lg">
    <h2 class="text-2xl font-bold text-gray-700 mb-6">🎟️ Danh sách vé</h2>

    <!-- Bộ lọc -->
    <div class="mb-6 flex flex-wrap gap-3">
      <select
        v-model="filters.eventId"
        class="border p-2 rounded-md w-1/3 focus:ring focus:ring-blue-300"
      >
        <option value="" disabled>Chọn sự kiện</option>
        <option
          v-for="event in events"
          :key="event.eventId"
          :value="event.eventId"
        >
          {{ event.eventTitle }}
        </option>
      </select>

      <select
        v-model="filters.status"
        class="border p-2 rounded-md w-1/3 focus:ring focus:ring-blue-300"
      >
        <option value="">Chọn trạng thái</option>
        <option value="PAID">✅ Đã Thanh Toán</option>
        <option value="UNPAID">⏳ Chưa Thanh Toán</option>
        <option value="CANCELLED">❌ Yêu Cầu Hủy</option>
      </select>

      <input
        v-model="filters.userEmail"
        type="text"
        placeholder="Nhập email"
        class="border p-2 rounded-md w-1/3 focus:ring focus:ring-blue-300"
      />

      <button
        @click="applyFilters"
        class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
      >
        🔍 Lọc
      </button>
      <button
        @click="clearFilters"
        class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
      >
        Xóa
      </button>
    </div>

    <!-- Hiển thị trạng thái tải -->
    <div v-if="loading" class="text-center text-gray-500">⏳ Đang tải...</div>

    <div v-else>
      <!-- Bảng vé -->
      <div class="overflow-x-auto">
        <table
          class="w-full border border-gray-200 shadow-md rounded-lg overflow-hidden"
        >
          <thead class="bg-blue-100 text-gray-700">
            <tr>
              <th class="p-3 border text-center">#</th>
              <th class="p-3 border text-center">Người đặt</th>
              <th class="p-3 border text-center">Ngày đặt / Ngày hết hạn</th>
              <th class="p-3 border text-center">Loại vé</th>
              <th class="p-3 border text-center">Giá</th>
              <th class="p-3 border text-center">Trạng thái</th>
              <th class="p-3 border text-center">Vị trí</th>
              <th class="p-3 border text-center"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(ticket, index) in tickets"
              :key="ticket.ticketId"
              class="text-center even:bg-gray-100 hover:bg-gray-200 transition"
            >
              <td class="p-3 border font-semibold">{{ ticket.ticketId }}</td>
              <td class="p-3 border">{{ ticket.ticketUserEmail }}</td>

              <td class="p-3 border">
                📆
                {{ new Date(ticket.ticketBookingTime).toLocaleDateString() }}
                <br />
                ⏳ {{ new Date(ticket.ticketExpiredTime).toLocaleDateString() }}
              </td>
              <td class="p-3 border">{{ ticket.ticketDuration }}</td>
              <td class="p-3 border font-semibold text-green-600">
                {{ ticket.ticketPrice.toLocaleString() }} VND
              </td>
              <td class="p-3 border">
                <span
                  :class="{
                    'text-green-600 font-semibold':
                      ticket.ticketStatus === 'PAID',
                    'text-yellow-600 font-semibold':
                      ticket.ticketStatus === 'UNPAID',
                    'text-red-600 font-semibold':
                      ticket.ticketStatus === 'CANCELLED',
                  }"
                >
                  {{
                    ticket.ticketStatus === "PAID"
                      ? " Đã Thanh Toán"
                      : ticket.ticketStatus === "UNPAID"
                      ? " Chưa Thanh Toán"
                      : " Đã Hủy"
                  }}
                </span>
              </td>
              <td class="p-3 border">{{ ticket.ticketPosition }}</td>
              <td class="p-3 border">
                <button
                  v-if="ticket.ticketStatus === 'CANCELLED'"
                  @click="deleteTicket(ticket.ticketId)"
                  class="text-red-500 hover:text-red-700 transition duration-300"
                >
                  <i class="fas fa-trash text-lg"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Phân trang -->
      <div class="flex justify-center mt-6 space-x-3">
        <button
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 0"
          class="px-4 py-2 bg-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-400 transition"
        >
          Trước
        </button>
        <span class="px-4 py-2 font-semibold">
          Trang {{ currentPage + 1 }} / {{ totalPages }}
        </span>
        <button
          @click="changePage(currentPage + 1)"
          :disabled="currentPage >= totalPages - 1"
          class="px-4 py-2 bg-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-400 transition"
        >
          Tiếp
        </button>
      </div>
    </div>
  </div>
</template>
