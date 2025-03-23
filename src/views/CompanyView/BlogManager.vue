<template>
  <div class="max-w-4xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4 text-center">📖 Blog Feed</h1>

    <!-- Bộ lọc -->
    <div class="flex flex-wrap gap-2 mb-4">
      <select v-model="filters.eventId" class="p-2 border rounded-lg">
        <option value="">Chọn sự kiện</option>
        <option
          v-for="event in events"
          :key="event.eventId"
          :value="event.eventId"
        >
          {{ event.eventTitle }}
        </option>
      </select>
      <select v-model="filters.month" class="p-2 border rounded-lg">
        <option value="">Chọn tháng</option>
        <option v-for="m in 12" :key="m" :value="m">{{ m }}</option>
      </select>
      <select v-model="filters.year" class="p-2 border rounded-lg">
        <option value="">Chọn năm</option>
        <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
      </select>
      <button
        @click="applyFilters"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        :disabled="invalidFilter"
      >
        Lọc
      </button>
    </div>

    <!-- Cảnh báo nếu bộ lọc không hợp lệ -->
    <p v-if="invalidFilter" class="text-red-500 mb-2">
      Nếu chọn tháng thì phải chọn năm và ngược lại!
    </p>

    <!-- Loading -->
    <div v-if="loading" class="text-center text-gray-500 mt-4">Đang tải...</div>

    <!-- Lỗi -->
    <div v-else-if="error" class="text-red-500 mt-4">{{ error }}</div>

    <!-- Danh sách blog dạng lưới 2 cột -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="blog in blogs"
        :key="blog.blogId"
        class="border border-gray-300 p-4 rounded-lg shadow-sm relative"
        @click="goBlogDetail(blog)"
      >
        <!-- Nội dung blog -->
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold">
            {{ blog.blogSubject || "Ẩn danh" }}
          </h2>
          <p class="text-sm text-gray-500">
            {{ new Date(blog.blogCreateDate).toLocaleDateString() }}
          </p>
        </div>
        <p class="text-gray-700 mt-1">
          {{ blog.blogContent.substring(0, 50) }} ...
        </p>

        <!-- Hình ảnh nếu có -->
        <div
          v-if="blog.eventListImgURL && blog.eventListImgURL.length"
          class="mt-2"
        >
          <img
            :src="blog.eventListImgURL[0]"
            class="w-full h-48 object-cover rounded-lg"
            alt="Blog Image"
          />
        </div>

        <!-- Cảm xúc -->
        <div class="flex items-center gap-4 mt-2 text-gray-500">
          <button
            @click.stop="likeBlog(blog.blogId)"
            class="flex items-center gap-2 text-gray-500 hover:text-red-500 transition"
          >
            ❤️ {{ blog.blogEmotionsNumber }}
          </button>
          <button
            @click="goBlogDetail(blog)"
            class="flex items-center gap-1 hover:text-blue-500"
          >
            💬 <span>Xem Bình Luận</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Phân trang -->
    <div class="flex justify-between items-center mt-4">
      <button
        @click="fetchBlogs(currentPage - 1)"
        :disabled="currentPage === 0"
        class="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
      >
        ⬅ Trước
      </button>

      <span class="text-gray-700"
        >Trang {{ currentPage + 1 }} / {{ totalPages }}</span
      >

      <button
        @click="fetchBlogs(currentPage + 1)"
        :disabled="currentPage >= totalPages - 1"
        class="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
      >
        Sau ➡
      </button>
    </div>
  </div>
</template>

<script>
import { api } from "@/api/Api";

export default {
  data() {
    return {
      blogs: [],
      showOptions: null, // ID của blog đang hiển thị menu
      currentPage: 0,
      totalPages: 1,
      loading: false,
      error: null,
      filters: {
        eventId: "",
        userId: this.$route.params.companyId,
        month: "",
        year: "",
      },
      events: [],
      availableYears: Array.from(
        { length: 10 },
        (_, i) => new Date().getFullYear() - i
      ), // Danh sách 10 năm gần nhất
    };
  },
  computed: {
    invalidFilter() {
      if (!this.filters.month && !this.filters.year) {
        return false; // Cho phép không chọn tháng và năm
      }
      return (
        (this.filters.month && !this.filters.year) ||
        (this.filters.year && !this.filters.month)
      );
    },
  },
  methods: {
    toggleOptions(blogId) {
      this.showOptions = this.showOptions === blogId ? null : blogId;
    },
    updateBlog(blog) {
      console.log("Cập nhật blog:", blog);
      // Thêm logic cập nhật blog ở đây (chẳng hạn mở form cập nhật)
    },
    deleteBlog(blogId) {
      if (confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
        console.log("Xóa blog với ID:", blogId);
        // Gọi API hoặc xóa blog khỏi danh sách
      }
    },
    goBlogDetail(blog) {
      this.$router.push(
        `/company/${this.filters.userId}/events/${blog.eventId}/blogs/${blog.blogId}`
      );
    },
    async likeBlog(blogId) {
      try {
        const userId = this.filters.userId; // Lấy userId từ dữ liệu hiện có
        const res = await api.post(`/blogs/${blogId}/emotion`, null, {
          params: { userId }, // Gửi userId qua query parameters
        });
        const updatedBlog = res.data;
        console.log(updatedBlog);

        // Cập nhật lại danh sách blogs
        this.blogs = this.blogs.map((blog) =>
          blog.blogId === blogId ? { ...blog, ...updatedBlog } : blog
        );
      } catch (error) {
        this.$toast.error(
          postError.response?.data?.message || "Lỗi khi thích bài viết"
        );
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
        this.$toast.error(
          postError.response?.data?.message || "Lỗi khi gửi blog"
        );
      }
    },
    async fetchBlogs(page = 0) {
      this.loading = true;
      this.error = null;
      try {
        const params = {};

        if (this.filters.eventId) params.eventId = this.filters.eventId;
        if (this.filters.userId) params.userId = this.filters.userId;
        if (this.filters.month) params.month = this.filters.month;
        if (this.filters.year) params.year = this.filters.year;

        params.page = page;
        params.size = 10;

        console.log("Params gửi API:", params);

        const response = await api.get("/blogs/filter", { params });
        this.blogs = response.data.data.content;
        this.currentPage = response.data.data.number;
        this.totalPages = response.data.data.totalPages;
      } catch (err) {
        this.error = "Không thể tải dữ liệu";
        this.$toast.error(
          postError.response?.data?.message || "Lỗi khi gửi blog"
        );
      } finally {
        this.loading = false;
      }
    },
    applyFilters() {
      if (this.invalidFilter) {
        console.warn("Lỗi: Nếu chọn tháng thì phải chọn năm và ngược lại!");
        return;
      }
      this.fetchBlogs(0);
    },
  },
  mounted() {
    this.fetchBlogs();
    this.fetchEvents();
  },
};
</script>

<style>
button:hover:not(:disabled) {
  background: #ddd;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2; /* Giới hạn 2 dòng */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
  max-height: 3em; /* Điều chỉnh theo font-size */
  line-height: 1.5em; /* Đảm bảo đúng 2 dòng */
}
</style>
