<template>
    <div class="container">
        <h2>Quản lý bài viết của bạn</h2>
        <div v-if="blogs.length">
            <div v-for="blog in blogs" :key="blog.blogId" class="blog-summary">
                <h3 class="blog-title">{{ blog.blogSubject }}</h3>
                <p><strong>Ngày tạo:</strong> {{ new Date(blog.blogCreateDate).toLocaleString() }}</p>
                <p class="blog-content">{{ blog.blogContent }}</p>
                <button @click="editBlog(blog.blogId)" class="btn btn-primary">Chỉnh sửa</button>
                <button @click="deleteBlog(blog.blogId)" class="btn btn-danger">Xóa</button>
            </div>
        </div>
        <div v-else>
            <p>Bạn chưa có bài viết nào.</p>
        </div>
    </div>
</template>

<script>
import { api } from "@/api/Api";
import { useCookies } from "vue3-cookies";

const { cookies } = useCookies();

export default {
    data() {
        return {
            blogs: [],
            userInfo: {},
            email: '',
        };
    },
    computed: {
        user() {
            return this.$authStore.user;
        },
    },
    methods: {
        async fetchUserInfo() {
            try {
                const res = await api.get(`/companies/${this.user.id}`);
                console.log(res.data);
                this.userInfo = res.data.data;
                this.email = cookies.get("email");
                this.$route.meta.userInfo = this.userInfo;
                sessionStorage.setItem("companyName", this.userInfo.companyName);

                cookies.set("companyName", this.userInfo.companyName, 900); // 900 giây = 15 phút
            } catch (error) {
                if (error.response?.status === 404) {
                    this.$toast.error("Chưa có thông tin công ty, hãy tạo mới!");
                    this.$router.push({
                        name: "CreateCompany",
                        query: { accountId: this.user.id },
                    });
                } else {
                    this.$toast.error(
                        error.response?.data?.message ||
                        "Đã xảy ra lỗi khi tải thông tin người dùng"
                    );
                }
            }
        },
        async fetchUserBlogs() {
            try {
                const response = await api.get(`/blog/by-user`, { params: { userId: this.user.id } });
                if (response.status === 200) {
                    this.blogs = response.data.data; // Đảm bảo lấy đúng dữ liệu
                }
            } catch (error) {
                console.error("Lỗi xảy ra trong quá trình lấy danh sách bài viết:", error);
                console.error("Chi tiết lỗi:", error.response);
                this.$toast.error("Lỗi xảy ra trong quá trình lấy danh sách bài viết");
            }
        },
        editBlog(blogId) {
            this.$router.push(`/blog/edit/${blogId}`);
        },
        async deleteBlog(blogId) {
            try {
                const response = await api.delete(`/blog/${blogId}`);
                if (response.status === 200) {
                    this.blogs = this.blogs.filter(blog => blog.blogId !== blogId);
                    this.$toast.success("Xóa bài viết thành công");
                }
            } catch (error) {
                console.error("Lỗi xảy ra trong quá trình xóa bài viết:", error);
                this.$toast.error("Lỗi xảy ra trong quá trình xóa bài viết");
            }
        }
    },
    created() {
        this.fetchUserInfo();
        this.fetchUserBlogs();
    }
};


</script>

<style scoped>
.container {
    max-width: 800px;
    margin: auto;
    padding: 20px;
}

.blog-summary {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 8px;
    margin-bottom: 10px;
}

.blog-title {
    font-size: 24px; /* Thay đổi kích thước font chữ */
    color: #333; /* Thay đổi màu sắc chữ */
}

.blog-content {
    margin-top: 5px;
}

.btn-primary {
    margin-right: 10px;
}
</style>
