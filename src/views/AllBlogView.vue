<template>
    <div class="container">
        <h2><strong>Tất cả các bài viết</strong></h2>
        <div v-if="blogs.length">
            <div v-for="blog in blogs" :key="blog.blogId" class="blog-summary" @click="viewBlogDetail(blog.blogId)">
                <h3 class="blog-title">{{ blog.blogSubject }}</h3>
                <p><strong>Ngày tạo:</strong> {{ new Date(blog.blogCreateDate).toLocaleString() }}</p>
                <p class="blog-content">{{ blog.blogContent }}</p>
                <div v-if="blog.eventListImgURL && blog.eventListImgURL.length" class="image-grid">
                    <div v-for="(url, index) in blog.eventListImgURL.slice(0, 3)" :key="index" class="image-container">
                        <img :src="url" alt="Blog Image" class="img-fluid my-2" />
                    </div>
                    <div v-if="blog.eventListImgURL.length > 3" class="image-container">
                        <img :src="blog.eventListImgURL[3]" alt="Blog Image" class="img-fluid my-2 overlay-image" />
                        <div class="overlay">
                            <span>+{{ blog.eventListImgURL.length - 3 }}</span>
                        </div>
                    </div>
                </div>
                <!-- <div class="heart-container">
                    <button @click.stop="toggleEmotion(blog.blogId)" :class="{ 'active': blog.isLiked }"
                        class="btn btn-heart">❤️</button>
                    <span>{{ blog.blogEmotionsNumber }} thả tim</span>
                </div> -->
            </div>
        </div>
        <div v-else>
            <p>Chưa có bài viết nào.</p>
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
        async fetchBlogs() {
            try {
                const response = await api.get('/blog'); // Đảm bảo gọi đúng endpoint
                if (response.status === 200) {
                    this.blogs = response.data;
                    // Sắp xếp bài viết theo ngày tạo giảm dần (bài viết mới nhất lên đầu)
                    this.blogs.sort((a, b) => new Date(b.blogCreateDate) - new Date(a.blogCreateDate));
                    // Cập nhật trạng thái thả tim cho từng blog
                    this.blogs.forEach(blog => {
                        if (blog.likedBy) {
                            blog.isLiked = blog.likedBy.includes(this.user.id);
                        } else {
                            blog.isLiked = false;
                        }
                    });
                }
            } catch (error) {
                console.log(error);
                this.$toast.error('Lỗi xảy ra trong quá trình lấy danh sách bài viết');
            }
        },
        viewBlogDetail(blogId) {
            this.$router.push(`/company/blog/${blogId}`); // Cập nhật đường dẫn đúng
        },
        async toggleEmotion(blogId) {
            try {
                console.log("userId", this.userInfo?.id);
                const response = await api.post(`/blog/${blogId}/emotion`, null, {
                    params: { userId: this.userInfo?.id }
                });
                if (response.status === 200) {
                    const blog = this.blogs.find(blog => blog.blogId === blogId);
                    blog.isLiked = response.data.isLiked;
                    blog.blogEmotionsNumber = response.data.blogEmotionsNumber;
                    this.$toast.success('Thay đổi trạng thái thả tim thành công!');
                }
            } catch (error) {
                console.log(error);
                this.$toast.error('Lỗi xảy ra trong quá trình thả tim');
            }
        }
    },
    created() {
        this.fetchBlogs();
        this.fetchUserInfo();
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
    cursor: pointer;
}

.blog-title {
    font-size: 24px; /* Thay đổi kích thước font chữ */
    color: #333; /* Thay đổi màu sắc chữ */
}

.blog-content {
    margin-top: 5px;
}

.image-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
}

.image-container {
    position: relative;
}

.img-fluid {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    object-fit: cover;
    aspect-ratio: 1/1;
}

.overlay {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    font-size: 24px;
    border-radius: 8px;
}

.heart-container {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
}

.btn-heart {
    background-color: transparent;
    border: none;
    color: #aaaaaa;
    font-size: 1.5rem;
    cursor: pointer;
    outline: none;
}

.btn-heart.active {
    color: #ff0000; /* Màu đỏ khi đã được thả tim */
}

.btn-heart:focus {
    outline: none;
}
</style>




