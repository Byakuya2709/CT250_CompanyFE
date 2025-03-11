<template>
  <div class="max-w-3xl mx-auto p-8 bg-white shadow-lg rounded-xl">
    <loading :active="loading" />
    <h2 class="text-3xl font-semibold mb-6 text-gray-800">Đăng Bài Viết</h2>
    <form @submit.prevent="submitBlog" class="space-y-6">
      <div>
        <label class="block text-gray-700 font-medium mb-2">Chọn sự kiện</label>
        <select
          v-model="blog.eventId"
          class="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300"
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
      </div>
      <div>
        <label class="block text-gray-700 font-medium mb-2">Tiêu đề</label>
        <input
          v-model="blog.blogSubject"
          class="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300"
          required
        />
      </div>

      <div>
        <label class="block text-gray-700 font-medium mb-2"
          >Chọn hình ảnh</label
        >
        <input
          type="file"
          id="eventImages"
          @change="handleImageChange"
          multiple
          accept="image/*"
          class="w-full p-2 border rounded-lg"
        />
        <div v-if="listImages.length" class="mt-4 flex flex-wrap gap-4">
          <div
            v-for="(image, index) in listImages"
            :key="index"
            class="relative group"
          >
            <img
              :src="image"
              class="w-24 h-24 rounded-lg shadow-md object-cover"
            />
            <button
              @click="removeImage(index)"
              class="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
            >
              Xóa
            </button>
          </div>
        </div>
      </div>

      <div>
        <label class="block text-gray-700 font-medium mb-2">Nội dung</label>
        <textarea
          v-model="blog.blogContent"
          class="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300"
          rows="5"
          required
        ></textarea>
      </div>

      <div>
        <label class="block text-gray-700 font-medium mb-2"
          >Loại bài viết</label
        >
        <select
          v-model="blog.blogType"
          class="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300"
          required
        >
          <option
            v-for="option in blogType"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>

      <button
        type="submit"
        class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
      >
        Đăng Bài
      </button>
    </form>
  </div>
</template>

<script>
import { api } from "@/api/Api";
import { blogType } from "@/composable/blogType";

import Loading from "vue-loading-overlay";
import "vue-loading-overlay/dist/css/index.css";
export default {
  components: { Loading },
  data() {
    return {
      blog: {
        blogSubject: "",
        blogContent: "",
        blogType: "",
        eventListImgURL: [],
        blogUserId: this.$route.params.companyId,
        eventId: "",
        blogEmotionsNumber: 0,
      },
      loading: false,
      events: [],
      blogType,
      imageInput: "",
      listImages: [],
      filesData: new FormData(),
    };
  },

  methods: {
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
    handleImageChange(event) {
      const files = event.target.files;
      if (files) {
        // Duyệt qua từng file và thêm vào FormData
        Array.from(files).forEach((file) => {
          this.filesData.append("files", file); // Thêm file gốc vào FormData
          const reader = new FileReader();
          reader.onload = (e) => {
            this.listImages.push(e.target.result); // Thêm base64 vào danh sách hiển thị nếu cần
          };
          reader.readAsDataURL(file);
        });
      }
    },
    async uploadImages() {
      const input = this.blog.blogSubject;
      const output = input.replace(/[^a-zA-ZÀ-ỹ0-9\s]/g, "");
      return await api.post("/media/upload/events", this.filesData, {
        params: { eventTitle: output },
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    removeImage(index) {
      this.listImages.splice(index, 1);
      const newFormData = new FormData();
      this.listImages.forEach((_, i) => {
        const file = this.filesData.getAll("files")[i]; // Lấy file từ FormData gốc
        newFormData.append("files", file); // Thêm lại các file còn lại vào FormData mới
      });

      this.filesData = newFormData;
      console.log(this.listImages);
    },
    async submitBlog() {
      this.loading = true;
      try {
        const imageResponse = await this.uploadImages();
        console.log("Full imageResponse:", imageResponse);

        const response = Array.isArray(imageResponse.data.data)
          ? imageResponse.data.data
          : [imageResponse.data.data];

        if (!Array.isArray(this.blog.eventListImgURL)) {
          this.blog.eventListImgURL = [];
        }

        const uniqueUrls = response.filter(
          (url) => !this.blog.eventListImgURL.includes(url)
        );
        this.blog.eventListImgURL.push(...uniqueUrls);

        console.log("Blog data before POST:", this.blog);

        // Gửi dữ liệu blog
        try {
          const res = await api.post("/blogs", this.blog);
          this.$toast.success(res.data.message);
        } catch (postError) {
          console.error("Error posting blog:", postError);
          this.$toast.error(
            postError.response?.data?.message || "Lỗi khi gửi blog"
          );
        }
      } catch (error) {
        console.error("Error in submitBlog:", error);
        this.$toast.error(error.response?.data?.message || "Đã xảy ra lỗi");
      } finally {
        this.loading = false;
      }
    },
  },
  mounted() {
    this.fetchEvents();
  },
};
</script>

<style scoped>
input,
textarea {
  border: 1px solid #ccc;
  padding: 10px;
}
</style>
