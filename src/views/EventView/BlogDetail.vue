<template>
  <div class="flex gap-4">
    <div
      style="min-width: 900px"
      class="mx-auto p-6 bg-white border border-gray-300 rounded-xl shadow-sm"
    >
      <!-- Header -->
      <div class="flex items-center gap-3 mb-4">
        <div class="w-12 h-12 bg-gray-300 rounded-full"></div>
        <div>
          <p class="text-gray-400 font-semibold">@{{ blog.blogUserId }}</p>
        </div>
      </div>
      <!-- Tiêu đề -->
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-bold text-gray-900 mb-3">
          {{ blog.blogSubject }}
        </h1>
        <div class="relative">
          <button
            @click="toggleOptions(blog.blogId)"
            class="p-2 hover:bg-gray-200 rounded-full"
          >
            &#8942;
          </button>

          <!-- Menu cập nhật/xóa -->
          <div
            v-if="showOptions === blog.blogId"
            class="absolute right-0 bg-white shadow-md rounded-md mt-1 z-10 w-32"
          >
            <button
              @click="openEditModal(blog)"
              class="block px-4 py-2 hover:bg-gray-100 w-full text-left"
            >
              📝 Cập nhật
            </button>
            <button
              @click="deleteBlog(blog.blogId)"
              class="block px-4 py-2 hover:bg-red-100 w-full text-left"
            >
              🗑️ Xóa
            </button>
          </div>

          <!-- Modal chỉnh sửa -->
          <div
            v-if="showEditModal"
            class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          >
            <div class="bg-white p-6 rounded-lg shadow-lg w-96">
              <h2 class="text-lg font-bold mb-4">Chỉnh sửa bài viết</h2>

              <!-- Input chỉnh sửa tiêu đề -->
              <input
                v-model="editedBlog.blogSubject"
                type="text"
                class="w-full border p-2 rounded mb-3"
                placeholder="Tiêu đề bài viết"
              />

              <!-- Input chỉnh sửa nội dung -->
              <textarea
                v-model="editedBlog.blogContent"
                class="w-full border p-2 rounded mb-3"
                placeholder="Nội dung bài viết"
                rows="8"
              ></textarea>

              <!-- Input chỉnh sửa loại bài viết -->

              <input
                v-model="editedBlog.blogType"
                type="text"
                class="w-full border p-2 rounded mb-3"
                placeholder="Loại bài viết"
              />

              <!-- Nút lưu hoặc hủy -->
              <div class="flex justify-end gap-2">
                <button
                  @click="closeEditModal"
                  class="px-4 py-2 bg-gray-300 rounded"
                >
                  Hủy
                </button>
                <button
                  @click="updateBlog"
                  class="px-4 py-2 bg-blue-500 text-white rounded"
                  :disabled="isUnchanged"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Nội dung bài viết -->
      <p class="text-gray-800 text-lg leading-relaxed mb-4">
        {{ blog.blogContent }}
      </p>
      <p class="text-sm text-gray-500">#{{ blog.blogType }}</p>

      <!-- Hình ảnh bài viết -->
      <div
        v-if="blog.eventListImgURL?.length"
        class="grid grid-cols-2 gap-2 mb-4 grid-auto-rows-[1fr]"
      >
        <template
          v-for="(img, index) in blog.eventListImgURL.slice(0, 4)"
          :key="img"
        >
          <div
            class="relative group cursor-pointer"
            @click="openImageViewer(index)"
          >
            <img
              :src="img"
              class="w-full h-auto aspect-[4/3] object-cover rounded-lg border"
            />
            <div
              v-if="index === 3 && blog.eventListImgURL.length > 4"
              class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white text-lg font-semibold rounded-lg"
            >
              +{{ blog.eventListImgURL.length - 4 }}
            </div>
          </div>
        </template>
      </div>

      <!-- Modal xem ảnh -->
      <div
        v-if="showImageViewer"
        class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      >
        <div class="relative max-w-4xl w-full p-4">
          <button
            @click="closeImageViewer"
            class="absolute top-2 right-2 text-white text-2xl"
          >
            &times;
          </button>
          <img
            :src="blog.eventListImgURL[currentImageIndex]"
            class="max-h-[80vh] w-auto mx-auto rounded-lg"
          />
          <div class="flex justify-between mt-4">
            <button
              v-if="currentImageIndex > 0"
              @click="prevImage"
              class="text-white text-lg"
            >
              ⬅ Trước
            </button>
            <button
              v-if="currentImageIndex < blog.eventListImgURL.length - 1"
              @click="nextImage"
              class="text-white text-lg"
            >
              Tiếp ➡
            </button>
          </div>
        </div>
      </div>

      <!-- Nút like -->
      <button
        @click="likeBlog"
        class="flex items-center gap-2 text-gray-500 hover:text-red-500 transition"
      >
        ❤️ {{ blog.blogEmotionsNumber }}
      </button>
      <!-- Nút ba chấm -->

      <!-- Bình luận -->
      <div class="mt-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-3">Bình luận</h2>

        <div class="mt-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-3">
            Thêm bình luận
          </h2>
          <textarea
            v-model="newComment"
            class="w-full p-2 border rounded-lg"
            placeholder="Nhập bình luận của bạn..."
          ></textarea>
          <button
            :disabled="!newComment.trim()"
            @click="submitComment"
            class="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          >
            Gửi bình luận
          </button>
        </div>

        <div
          v-for="comment in comments"
          :key="comment.cmtId"
          class="flex gap-3 p-3 border-b items-center"
        >
          <div>
            <img
              v-if="userCache[comment.cmtUserId]?.imageURL"
              :src="userCache[comment.cmtUserId].imageURL"
              class="w-10 h-10 object-cover rounded-full border"
            />
            <div v-else class="w-10 h-10 bg-gray-300 rounded-full"></div>
          </div>
          <div class="flex-1">
            <p class="text-gray-800 font-semibold">
              {{
                userCache[comment.cmtUserId]?.userName || "Người dùng ẩn danh"
              }}
              <span
                v-if="comment.cmtUserId === blog.blogUserId"
                class="text-red-500"
              >
                (Chủ blog)
              </span>
            </p>

            <div v-if="editingCommentId === comment.cmtId">
              <textarea
                v-model="editedCommentContent"
                class="w-full p-2 border rounded-lg"
              ></textarea>
              <div class="flex justify-end gap-2 mt-2">
                <button
                  @click="cancelEditComment"
                  class="px-4 py-2 bg-gray-300 rounded"
                >
                  Hủy
                </button>
                <button
                  @click="updateComment(comment)"
                  class="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Lưu
                </button>
              </div>
            </div>
            <div v-else>
              <p class="text-gray-800 text-sm">{{ comment.cmtContent }}</p>
              <small class="text-gray-500 block mt-1">{{
                new Date(comment.cmtCreateDate).toLocaleString()
              }}</small>
            </div>
          </div>
          <div v-if="editingCommentId !== comment.cmtId">
            <button
              @click="editComment(comment)"
              class="text-blue-500 text-sm hover:underline"
            >
            <i class="fa-solid fa-pen"></i>
            </button>
            <button
              @click="deleteComment(comment.cmtId)"
              class="text-red-500 text-sm hover:underline"
            >
            <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>

        <!-- Nút Xem thêm bình luận -->
        <div v-if="!lastPage" class="text-center mt-4">
          <button
            @click="loadMoreComments"
            class="text-blue-500 hover:underline text-sm"
          >
            Xem thêm bình luận
          </button>
        </div>
      </div>

      <!-- Phân trang bình luận -->
      <div class="flex justify-between mt-4">
        <button
          v-if="page > 0"
          @click="prevPage"
          class="text-blue-500 hover:underline text-sm"
        >
          Trước
        </button>
        <button
          v-if="!lastPage"
          @click="nextPage"
          class="text-blue-500 hover:underline text-sm"
        >
          Sau
        </button>
      </div>
    </div>

    <div style="max-width: 600px" class="p-4 bg-gray-100 rounded-lg shadow-md">
      <h2 class="text-lg font-semibold text-gray-700 mb-3">Bài viết gần đây</h2>
      <div class="recent-blogs-container">
        <div v-for="blog in blogs" :key="blog.blogId" class="blog-card">
          <h3 class="text-md font-semibold text-gray-800">
            {{ blog.blogSubject }}
          </h3>
          <p class="text-sm text-gray-600">
            {{
              blog.expanded
                ? blog.blogContent
                : blog.blogContent.substring(0, 100) + "..."
            }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
/* Thanh cuộn tùy chỉnh */
.recent-blogs-container {
  @apply max-h-80 overflow-y-auto space-y-3 px-2;
  scrollbar-width: thin;
  scrollbar-color: #64748b #f1f5f9;
  scroll-behavior: smooth;
}

.recent-blogs-container::-webkit-scrollbar {
  @apply w-2;
}
.recent-blogs-container::-webkit-scrollbar-thumb {
  @apply bg-gray-500 rounded-md;
}
.recent-blogs-container::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-600;
}
.recent-blogs-container::-webkit-scrollbar-track {
  @apply bg-gray-300 rounded-md;
}

/* Hiệu ứng hover thẻ bài viết */
.blog-card {
  @apply bg-white p-3 rounded-lg shadow-md border border-gray-200 transition-transform duration-300 hover:scale-105 hover:shadow-lg;
}

/* Hiệu ứng hover nhẹ nhàng */
button {
  transition: all 0.2s ease-in-out;
}
button:hover {
  transform: scale(1.05);
}
</style>

<script>
import { api } from "@/api/Api";
import Swal from "sweetalert2";
import { Filter } from "bad-words";

export default {
  data() {
    return {
      showEditModal: false,
      editedBlog: {},

      showOptions: null,
      blogs: [],
      blog: {},
      event: {},
      comments: [],
      page: 0,
      size: 10,
      lastPage: false,
      userCache: {},

      newComment: "",

      showImageViewer: false,
      currentImageIndex: 0,

      editingCommentId: null,
      editedCommentContent: "",
    };
  },
  computed: {
    isUnchanged() {
      return (
        this.editedBlog.blogSubject === this.blog.blogSubject &&
        this.editedBlog.blogContent === this.blog.blogContent &&
        this.editedBlog.blogType === this.blog.blogType
      );
    },
  },
  methods: {
    editComment(comment) {
      this.editingCommentId = comment.cmtId;
      this.editedCommentContent = comment.cmtContent;
    },
    cancelEditComment() {
      this.editingCommentId = null;
      this.editedCommentContent = "";
    },
    async updateComment(comment) {
      try {
        if (
          comment.cmtContent.trim === this.editedCommentContent.trim() ||
          !this.editedCommentContent.trim()
        ) {
          this.$toast.info("Nội dung bình luận không thay đổi.");
          this.cancelEditComment();
          return;
        }

        const filter = new Filter();
        if (filter.isProfane(this.editedCommentContent)) {
          this.$toast.warning("Bình luận chứa nội dung không phù hợp!");
          this.cancelEditComment();
          return;
        }
        const blogMasterId = this.$route.params.companyId;
        const body = {
          cmtContent: this.editedCommentContent,
          userId: blogMasterId,
        };

        const response = await api.patch(
          `/blogs/comment/${comment.cmtId}`,
          body
        );
        const updatedComment = response.data.data;
        const index = this.comments.findIndex((c) => c.cmtId === comment.cmtId);
        if (index !== -1) {
          this.comments.splice(index, 1, updatedComment);
        }
        this.$toast.success("Bình luận đã được cập nhật!");
        this.cancelEditComment();
      } catch (error) {
        this.$toast.error(
          error.response?.data?.message || "Lỗi khi cập nhật bình luận"
        );
        console.error("Lỗi khi cập nhật bình luận:", error);
      }
    },
    async submitComment() {
      if (!this.newComment.trim()) {
        alert("Bình luận không được để trống!");
        return;
      }

      const filter = new Filter();
      if (filter.isProfane(this.newComment)) {
        this.$toast.warning("Bình luận chứa nội dung không phù hợp!");
        return;
      }
      this.loading = true;

      const userId = this.$route.params.companyId;
      try {
        const body = {
          cmtContent: this.newComment,
          cmtEmotionsNumber: 0,
          cmtUserId: userId,
        };
        // Gửi bình luận lên API
        const response = await api.post(
          `/blogs/${this.blog.blogId}/comment`,
          body
        );
        const newCmt = response.data.data;

        // // ✅ Thêm user vào cache nếu chưa có
        // if (!this.userCache[this.userInfo.id]) {
        //   this.userCache[this.userInfo.id] = this.userInfo;
        // }

        this.comments.unshift(newCmt); // Thêm vào danh sách bình luận
        this.newComment = ""; // Reset ô nhập
      } catch (error) {
        this.$toast.error(
          error.response?.data?.message || "Lỗi khi gửi bình luận"
        );
      } finally {
        this.loading = false;
      }
    },

    openEditModal(blog) {
      this.editedBlog = { ...blog }; // Sao chép dữ liệu bài viết vào biến chỉnh sửa
      this.showEditModal = true;
    },

    // Đóng modal
    closeEditModal() {
      this.showEditModal = false;
      this.editedBlog = {}; // Xóa dữ liệu sau khi đóng
    },
    toggleOptions(blogId) {
      this.showOptions = this.showOptions === blogId ? null : blogId;
    },
    async updateBlog() {
      try {
        const formattedBlogType = this.editedBlog.blogType.replace(/\s+/g, "_"); // Thay dấu cách bằng "_"

        const res = await api.patch(`/blogs/${this.editedBlog.blogId}`, {
          blogSubject: this.editedBlog.blogSubject,
          blogContent: this.editedBlog.blogContent,
          blogType: formattedBlogType,
        });
        this.blog = res.data.data;
        this.$toast.success("Bài viết đã được cập nhật!");
        this.closeEditModal();
      } catch (error) {
        this.$toast.error(
          error.response?.data?.message || "Lỗi khi cập nhật bài viết"
        );
        console.error("Lỗi khi cập nhật bài viết:", error);
      }
    },
    async deleteBlog(blogId) {
      const result = await Swal.fire({
        title: "Xác nhận xóa?",
        text: "Bạn có chắc chắn muốn xóa Bài viết này?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
      });

      if (!result.isConfirmed) {
        return;
      }
      try {
        await api.delete(`/blogs/${blogId}`);
        this.$toast.success("Bài viết đã được xóa thành công");
        this.$router.push(`/company/${this.$route.params.companyId}/blogs`);
      } catch (error) {
        this.$toast.error(
          error.response?.data?.message || "Lỗi khi xóa tài khoản"
        );
        console.error("Lỗi khi xóa tài khoản:", error);
      }
    },
    async deleteComment(commentId) {
      const result = await Swal.fire({
        title: "Xác nhận xóa?",
        text: "Bạn có chắc chắn muốn xóa bình luận này?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
      });

      if (!result.isConfirmed) {
        return;
      }

      try {
        await api.delete(`/blogs/comment/${commentId}`);
        this.comments = this.comments.filter((c) => c.cmtId !== commentId);
        this.$toast.success("Đã xóa bình luận!");
      } catch (error) {
        this.$toast.error("Lỗi khi xóa bình luận!");
        console.error("Lỗi khi xóa bình luận:", error);
      }
    },
    openImageViewer(index) {
      this.currentImageIndex = index;
      this.showImageViewer = true;
    },
    closeImageViewer() {
      this.showImageViewer = false;
    },
    prevImage() {
      if (this.currentImageIndex > 0) {
        this.currentImageIndex--;
      }
    },
    nextImage() {
      if (this.currentImageIndex < this.blog.eventListImgURL.length - 1) {
        this.currentImageIndex++;
      }
    },
    async fetchBlog() {
      try {
        const response = await api.get(`/blogs/${this.$route.params.blogId}`);
        this.blog = response.data.data;
      } catch (error) {
        this.$toast.error(error.response?.data?.message || "Đã xảy ra lỗi");
      }
    },
    async fetchBlogsRecent() {
      try {
        const response = await api.get(`/blogs/recent`);
        this.blogs = response.data;
      } catch (error) {
        this.$toast.error(error.response?.data?.message || "Đã xảy ra lỗi");
      }
    },
    async fetchComments() {
      if (this.lastPage) return;
      try {
        const response = await api.get(
          `/blogs/${this.$route.params.blogId}/comment?page=${this.page}&size=${this.size}`
        );
        console.log(response);
        const newComments = response.data.data.content;
        this.comments = newComments;
        this.lastPage = response.data.data.last;
        this.fetchUserDetails(newComments);
      } catch (error) {
        this.$toast.error(error.response?.data?.message || "Đã xảy ra lỗi");
      }
    },
    async fetchUserDetails(comments) {
      const blogUserId = this.blog.blogUserId; // Lấy ID của chủ blog

      const userIdsToFetch = comments
        .map((comment) => comment.cmtUserId)
        .filter(
          (userId) => userId !== blogUserId && !this.userCache[userId] // Bỏ qua chủ blog & user đã cache
        );

      if (userIdsToFetch.length === 0) return;

      try {
        const userPromises = userIdsToFetch.map((userId) =>
          api.get(`/users/info/${userId}`)
        );

        const userResponses = await Promise.all(userPromises);

        // Cập nhật userCache
        const newUserCache = { ...this.userCache };
        userResponses.forEach((response, index) => {
          newUserCache[userIdsToFetch[index]] = response.data.data;
        });

        this.userCache = newUserCache;
      } catch (error) {
        console.error("Lỗi lấy thông tin người dùng:", error);
      }
    },
    async likeBlog() {
      try {
        const userId = this.$route.params.companyId; // Lấy userId từ dữ liệu hiện có
        const res = await api.post(`/blogs/${this.blog.blogId}/emotion`, null, {
          params: { userId }, // Gửi userId qua query parameters
        });
        const updatedBlog = res.data;
        console.log(updatedBlog);

        // Cập nhật lại danh sách blogs
        this.blog = updatedBlog;
      } catch (error) {
        this.$toast.error(
          error.response?.data?.message || "Lỗi khi thích bài viết"
        );
      }
    },
    loadMoreComments() {
      this.page += 1;
      this.fetchComments();
    },
    prevPage() {
      if (this.page > 0) {
        this.page -= 1;
        this.fetchComments();
      }
    },
    nextPage() {
      if (!this.lastPage) {
        this.page += 1;
        this.fetchComments();
      }
    },
  },
  mounted() {
    this.fetchBlog();
    this.fetchComments();
    this.fetchBlogsRecent();
  },
};
</script>
