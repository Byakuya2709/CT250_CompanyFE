<template>
    <div class="container">
        <h2><strong>Tất cả các bài viết</strong></h2>
        <div v-if="blogs.length">
            <div v-for="blog in blogs" :key="blog.blogId" class="blog-summary">
                <h3 @click="viewBlogDetail(blog.blogId)" class="blog-title">{{ blog.blogSubject }}</h3>
                <p><strong>Ngày tạo:</strong> {{ new Date(blog.blogCreateDate).toLocaleString() }}</p>
                <p class="blog-content">{{ blog.blogContent }}</p>
                <div v-if="blog.eventListImgURL && blog.eventListImgURL.length" class="image-grid">
                    <div v-for="(url, index) in blog.eventListImgURL" :key="index" class="image-container">
                        <img :src="url" alt="Blog Image" class="img-fluid my-2" />
                    </div>
                </div>
                <div class="heart-container">
                    <button @click="toggleEmotion(blog.blogId)" :class="{'active': blog.isLiked}" class="btn btn-heart">❤️</button>
                    <span>{{ blog.blogEmotionsNumber }} thả tim</span>
                </div>
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
            user: {
                id: cookies.get("userId") // Lấy userId từ cookie
            }
        };
    },
    methods: {
        async fetchBlogs() {
            try {
                const response = await api.get('/blog'); // Đảm bảo gọi đúng endpoint
                if (response.status === 200) {
                    this.blogs = response.data;
                    // Cập nhật trạng thái thả tim cho từng blog
                    this.blogs.forEach(blog => {
                        blog.isLiked = blog.likedBy.includes(this.user.id);
                    });
                }
            } catch (error) {
                this.$toast.error('Lỗi xảy ra trong quá trình lấy danh sách bài viết');
            }
        },
        viewBlogDetail(blogId) {
            this.$router.push(`/blog/${blogId}`);
        },
        async toggleEmotion(blogId) {
            try {
                const response = await api.post(`/blog/${blogId}/emotion`, null, {
                    params: { userId: this.user.id }
                });
                if (response.status === 200) {
                    const blog = this.blogs.find(blog => blog.blogId === blogId);
                    blog.isLiked = !blog.isLiked;
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
    color: #007bff;
    cursor: pointer;
}

.blog-title:hover {
    text-decoration: underline;
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
    max-width: 100%;
    height: auto;
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
    color: #aaaaaa; /* Màu xám khi chưa được thả tim */
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

