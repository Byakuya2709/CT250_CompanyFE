<template>
  <div
    class="max-w-md mx-auto bg-white shadow-xl rounded-2xl overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-2xl"
  >
    <!-- Hình ảnh sự kiện -->
    <img
      v-if="event.eventListImgURL?.length"
      :src="event.eventListImgURL[0]"
      alt="Event Image"
      class="w-full h-56 object-cover"
    />

    <div class="p-6 space-y-4">
      <!-- Tiêu đề với gradient -->
      <h2 class="text-2xl font-bold text-gray-800">
        <span
          class="bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text"
        >
          {{ event.eventTitle }}
        </span>
      </h2>

      <!-- Thông tin sự kiện -->
      <div class="text-gray-600 text-sm space-y-2">
        <p class="flex items-center gap-2">
          📍 <span class="font-medium">{{ event.eventAddress }}</span>
        </p>
        <p class="flex items-center gap-2">
          📅 {{ formatDate(event.eventStartDate) }} -
          {{ formatDate(event.eventEndDate) }}
        </p>
        <p class="flex items-center gap-2">
          ⏳
          <span class="font-semibold text-blue-600"
            >{{ event.eventDuration }} ngày</span
          >
        </p>
        <p class="flex items-center gap-2">
          💰
          <span class="font-semibold text-green-600">{{
            formatPrice(event.eventPrice)
          }}</span>
        </p>
      </div>

      <!-- Nút xem chi tiết -->
      <router-link
        :to="`/company/events/${event.eventId}`"
        class="block w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-semibold text-lg text-center transition hover:opacity-90"
      >
        Xem chi tiết
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    event: Object,
  },
  methods: {
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    formatPrice(price) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(price);
    },
  },
};
</script>

<style scoped>
@import "tailwindcss/tailwind.css";
</style>
