<script>
import {api} from '@/api/Api';

export default {
  data() {
    return {
      tickets: [],
      events: [],
      totalPages: 1,
      currentPage: 0,
      loading: false,
      filters: {
        eventId: '',
        status: '',
        userEmail: ''
      }
    };
  },
  methods: {
    async fetchTickets(page = 0) {
      this.loading = true;
      try {
        if (this.filters.eventId == "") return
        const params = new URLSearchParams({ page, size: 10 });
        if (this.filters.eventId) params.append('eventId', this.filters.eventId);
        if (this.filters.status) params.append('status', this.filters.status);
        if (this.filters.userEmail) params.append('userEmail', this.filters.userEmail);
        
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
    async fetchEvents() {
      try {
        const response = await api.get(`/events/company/${this.$route.params.companyId}/filter`);
        this.events = response.data.data;
        console.log( this.events)
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    },
    applyFilters() {
      this.fetchTickets(0);
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
  <div class="p-4 max-w-4xl mx-auto">
    <h2 class="text-xl font-bold mb-4">Danh sách vé</h2>
    
    <div class="mb-4 flex space-x-2">
      <select v-model="filters.eventId" class="border p-2 rounded w-1/3">
        <option value="" disabled>Chọn sự kiện</option>
        <option v-for="event in events" :key="event.eventId" :value="event.eventId">{{ event.eventTitle }}</option>
      </select>
      <select v-model="filters.status" class="border p-2 rounded w-1/3">
        <option value="">Chọn trạng thái thanh toán</option>
        <option value="PAID">Đã Thanh Toán</option>
        <option value="UNPAID">Chưa Thanh Toán</option>
    </select>
      <input v-model="filters.userEmail" type="text" placeholder="Nhập email" class="border p-2 rounded w-1/3">
      <button @click="applyFilters" class="bg-blue-500 text-white px-4 py-2 rounded">Lọc</button>
    </div>
    
    <div v-if="loading" class="text-center">Đang tải...</div>
    <div v-else>
      <table class="w-full border border-gray-200 shadow-lg rounded-lg overflow-hidden">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-3 border">#</th>
            <th class="p-3 border">Người đặt</th>
            <th class="p-3 border">Ngày đặt</th>
            <th class="p-3 border">Loại vé</th>
            <th class="p-3 border">Giá</th>
            <th class="p-3 border">Trạng thái</th>
            <th class="p-3 border">Vị trí</th>
           
          </tr>
        </thead>
        <tbody>
          <tr v-for="(ticket, index) in tickets" :key="ticket.ticketId" class="text-center">
            <td class="p-3 border">{{ ticket.ticketId}}</td>
            <td class="p-3 border">{{ ticket.ticketUserEmail}}</td>
    
            <td class="p-3 border">{{ new Date(ticket.ticketBookingTime).toLocaleDateString() }}</td>
            <td class="p-3 border">{{ ticket.ticketDuration}}</td>
            <td class="p-3 border">{{ ticket.ticketPrice.toLocaleString() }} VND</td>
            <td class="p-3 border">{{ ticket.ticketStatus }}</td>
            <td class="p-3 border">{{ ticket.ticketPosition }}</td>
           
          </tr>
        </tbody>
      </table>
      <div class="flex justify-center mt-4">
        <button @click="changePage(currentPage - 1)" :disabled="currentPage === 0"
          class="px-4 py-2 mx-1 bg-blue-200 rounded disabled:opacity-50 hover:bg-blue-600">Trước</button>
        <span class="px-4 py-2">Trang {{ currentPage + 1 }} / {{ totalPages }}</span>
        <button @click="changePage(currentPage + 1)" :disabled="currentPage >= totalPages - 1"
          class="px-4 py-2 mx-1 bg-blue-200 rounded disabled:opacity-50 hover:bg-blue-600">Tiếp</button>
      </div>
    </div>
  </div>
</template>
