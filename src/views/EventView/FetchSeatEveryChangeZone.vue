<template>
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content">
        <h2>Đặt vé sự kiện</h2>
        <p><strong>Sự kiện:</strong> {{ event.eventTitle }}</p>
  
        <label for="zone">Chọn khu vực:</label>
        <select v-model="selectedZone" @change="fetchSeats">
          <option v-for="zone in zones" :key="zone.zoneId" :value="zone">
            {{ zone.zoneName }} (Còn {{ zone.remainingCapacity }} chỗ)
          </option>
        </select>
  
        <div v-if="selectedZone" class="seat-container">
          <h3>Chọn ghế trong khu vực {{ selectedZone.zoneName }}</h3>
          <div class="seat-grid">
            <button
              v-for="seat in availableSeats"
              :key="seat"
              :class="{
                seat: true,
                selected: selectedSeats.includes(seat),
                paid: bookedSeats[seat] === 'PAID',
                unpaid: bookedSeats[seat] === 'UNPAID',
              }"
              :disabled="bookedSeats[seat] === 'PAID'"
              @click="toggleSeat(seat)"
            >
              {{ seat }}
            </button>
          </div>
        </div>
  
        <button @click="bookTicket" :disabled="selectedSeats.length === 0">
          Xác nhận đặt {{ selectedSeats.length }} ghế
        </button>
        <button class="close-btn" @click="$emit('close')">Đóng</button>
      </div>
    </div>
  </template>
  
  <script>
  import { api } from "@/api/Api";
  
  export default {
    props: {
      event: Object,
      day: Object, // Đảm bảo `day` là số nguyên
    },
    data() {
      return {
        selectedSeats: [],
        bookedSeats: {},
        zones: [],
        selectedZone: null,
        availableSeats: [],
        cachedSeats: {}, // Dùng để lưu dữ liệu ghế của từng zone
      };
    },
    async mounted() {
      await this.fetchZones();
    },
    watch: {
      day() {
        this.fetchZones(); // Tự động làm mới khi `day` thay đổi
      },
    },
    methods: {
      async fetchZones() {
        try {
          const response = await api.get(`/booking/zone/${this.event.eventId}`, {
            params: { day: this.day.day }, // Truyền day vào params
          });
  
          this.zones = response.data.data;
        } catch (error) {
          console.error("Lỗi lấy dữ liệu zone:", error);
        }
      },
      async fetchSeats() {
        if (!this.selectedZone) return;
  
        try {
          const response = await api.get(`/events/tickets/${this.event.eventId}`, {
            params: { day: this.day.day }, // Lọc theo ngày
          });
  
          const tickets = response.data.data || []; // Nếu null, dùng mảng rỗng
          this.bookedSeats = tickets.reduce((acc, ticket) => {
            acc[ticket.ticketPosition] = ticket.ticketStatus;
            return acc;
          }, {});
  
          this.availableSeats = Array.from(
            { length: this.selectedZone.zoneCapacity },
            (_, i) => `${this.selectedZone.zoneName}_${i + 1}`
          );
        } catch (error) {
          console.error("Lỗi lấy dữ liệu vé:", error);
        }
      },
      toggleSeat(seat) {
        if (this.selectedSeats.includes(seat)) {
          this.selectedSeats = this.selectedSeats.filter((s) => s !== seat);
        } else {
          this.selectedSeats.push(seat);
        }
      },
      bookTicket() {
        if (this.selectedSeats.length > 0) {
          alert(`Bạn đã đặt vé thành công! Ghế: ${this.selectedSeats.join(", ")}`);
          this.$emit("close");
        }
      },
    },
  };
  </script>
  <style scoped>
  .modal-overlay {
    z-index: 10000;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .modal-content {
    background: white;
    padding: 20px;
    border-radius: 10px;
    width: 90vw;
    height: 90vh;
    text-align: center;
  }
  
  select {
    margin: 10px;
    padding: 5px;
    font-size: 16px;
  }
  
  button {
    margin: 10px;
    padding: 10px 16px;
    border: none;
    cursor: pointer;
    border-radius: 5px;
  }
  
  .close-btn {
    background-color: gray;
    color: white;
  }
  
  .seat-container {
    margin-top: 15px;
  }
  
  .seat-grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    justify-content: center;
    padding: 10px;
    gap: 0;
  }
  
  .seat {
    width: 40px;
    height: 40px;
    border-radius: 5px;
    background-color: lightgray;
    cursor: pointer;
    border: none;
    padding: 0;
  }
  
  .seat.selected {
    background-color: green;
    color: white;
  }
  
  .seat.paid {
    background-color: red;
    cursor: not-allowed;
    opacity: 0.7;
  }
  
  .seat.unpaid {
    background-color: blue;
    color: white;
  }
  </style>