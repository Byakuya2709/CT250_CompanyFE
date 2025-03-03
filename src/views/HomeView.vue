<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 class="text-2xl font-bold text-blue-600">Event Ticket</h1>
      <nav>
        <ul class="flex space-x-4">
          <li><a href="#" class="text-gray-700 hover:text-blue-600">Trang chủ</a></li>
          <li><a href="#" class="text-gray-700 hover:text-blue-600">Sự kiện</a></li>
          <li><a href="#" class="text-gray-700 hover:text-blue-600">Liên hệ</a></li>
        </ul>
      </nav>
    </header>

    <!-- Banner -->
    <section class="relative w-full h-64 bg-cover bg-center" style="background-image: url('https://source.unsplash.com/1600x900/?concert');">
      <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <h2 class="text-white text-3xl font-bold">Mua vé sự kiện dễ dàng & nhanh chóng</h2>
      </div>
    </section>

    <!-- Sự kiện nổi bật -->
    <section class="py-10 px-4">
      <h3 class="text-2xl font-semibold text-gray-800 text-center mb-6">Sự kiện nổi bật</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="event in events" :key="event.id" class="bg-white p-4 rounded-lg shadow-md">
          <img :src="event.image" alt="event.title" class="w-full h-40 object-cover rounded-md" />
          <h4 class="text-lg font-semibold mt-3">{{ event.title }}</h4>
          <p class="text-gray-600">{{ event.date }}</p>
          <button class="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md">Mua vé</button>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white text-center py-4">
      <p>&copy; 2024 Event Ticket. All rights reserved.</p>
    </footer>
  </div>
</template>

<script>
export default {
  data() {
    return {
      events: [
        { id: 1, title: "Rock Concert", date: "12/03/2024", image: "https://source.unsplash.com/400x300/?rock-concert" },
        { id: 2, title: "Tech Conference", date: "20/03/2024", image: "https://source.unsplash.com/400x300/?conference" },
        { id: 3, title: "Food Festival", date: "05/04/2024", image: "https://source.unsplash.com/400x300/?food-festival" }
      ]
    };
  }
};
</script>
