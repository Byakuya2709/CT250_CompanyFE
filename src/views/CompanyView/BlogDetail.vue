<template>
    <div class="container">
        <h2><strong>{{ blog.blogSubject }}</strong></h2>
        <p><strong>Ngày tạo:</strong> {{ new Date(blog.blogCreateDate).toLocaleString() }}</p>
        <p>{{ blog.blogContent }}</p>
        
        <div v-if="blog.eventListImgURL && blog.eventListImgURL.length" class="image-grid">
            <div v-for="(url, index) in blog.eventListImgURL" :key="index" class="image-container">
                <img :src="url" alt="Blog Image" class="img-fluid my-2" @click="openLightbox(index)" />
            </div>
        </div>

        <div class="heart-container">
            <button @click="toggleEmotion(blog.blogId, user.id)" :class="{'active': blog.isLiked}" class="btn btn-heart"><i class="fa-solid fa-heart"></i></button>
            <span>{{ blog.blogEmotionsNumber }} thả tim</span>
        </div>

        <!-- <vue-image-lightbox 
            :images="blog.eventListImgURL"
            :index="lightboxIndex"
            @close="lightboxIndex = -1"
            v-if="lightboxIndex !== -1"
        /> -->

        <!-- Bình luận -->
        <div class="comments-section mt-4">
            <h3><strong>Bình luận</strong></h3>
            <div v-if="comments.length">
                <div v-for="comment in comments" :key="comment.cmtId" class="comment-box">
                    <p><strong>{{ comment.cmtUserId }}</strong> - {{ new Date(comment.cmtCreateDate).toLocaleString() }}</p>
                    <p>{{ comment.cmtContent }}</p>
                    <button v-if="comment.cmtUserId === user.id" @click="deleteComment(comment.cmtId)">Xóa</button> <!-- Hiển thị nút Xóa nếu người dùng đã bình luận -->
                </div>
            </div>
            <div v-else>
                <p>Chưa có bình luận nào.</p>
            </div>
        </div>

        <!-- Form Đăng bình luận -->
        <div class="post-comment mt-4">
            <h3><strong>Đăng bình luận</strong></h3>
            <form @submit.prevent="postComment">
                <div class="form-group">
                    <label for="cmtContent">Bình luận</label>
                    <textarea id="cmtContent" v-model="newComment.cmtContent" class="form-control" required></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Đăng bình luận</button>
            </form>
        </div>
    </div>
</template>


<script>
import { api } from "@/api/Api"; // Sử dụng API từ api/Api.js
import { useCookies } from "vue3-cookies";
import VueImageLightbox from 'vue-image-lightbox';
import 'vue-image-lightbox/dist/vue-image-lightbox.min.css'; // Đảm bảo bạn đã cài đặt thư viện này

const { cookies } = useCookies(); // Lấy cookie API

export default {
    components: {
        VueImageLightbox
    },
    data() {
        return {
            userInfo: {},
            blog: {
                eventListImgURL: [],
                blogEmotionsNumber: 0,
                isLiked: false // Thêm trạng thái thả tim
            },
            comments: [],
            newComment: {
                cmtContent: '',
                cmtUserId: '', // Bạn có thể thiết lập ID người dùng từ hệ thống xác thực của mình
            },
            lightboxIndex: -1
        };
    },
    computed: {
        user() {
            return this.$authStore.user;
        },
    },
    methods: {
        openLightbox(index) {
            this.lightboxIndex = index;
        },
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
        async fetchBlogDetail() {
            try {
                const { blogId } = this.$route.params; // Lấy blogId từ URL
                const response = await api.get(`/blog/${blogId}`);
                if (response.status === 200) {
                    this.blog = response.data.data;
                    // Kiểm tra trạng thái isLiked của người dùng cho bài viết này
                    this.checkUserLikeStatus(blogId);
                }
            } catch (error) {
                this.$toast.error('Lỗi xảy ra trong quá trình lấy thông tin bài viết');
            }
        },
        async checkUserLikeStatus(blogId) {
            try {
                const response = await api.get(`/blog/${blogId}/check-liked`, {
                    params: { userId: this.user.id }
                });
                if (response.status === 200) {
                    this.blog.isLiked = response.data.isLiked;
                }
            } catch (error) {
                console.error('Lỗi xảy ra trong quá trình kiểm tra trạng thái thả tim:', error);
            }
        },
        async fetchComments() {
            try {
                const { blogId } = this.$route.params; // Lấy blogId từ URL
                const response = await api.get(`/blog/${blogId}/comments`);
                if (response.status === 200) {
                    this.comments = response.data.data;
                }
            } catch (error) {
                this.$toast.error('Lỗi xảy ra trong quá trình lấy bình luận');
            }
        },
        async postComment() {
            console.log("user info", this.userInfo);
            try {
                const { blogId } = this.$route.params; // Lấy blogId từ URL
                this.newComment.cmtUserId = this.userInfo.companyName;
                const response = await api.post(`/blog/${blogId}/post-comment`, this.newComment);
                if (response.status === 201) {
                    this.$toast.success('Đăng bình luận thành công');
                    this.fetchComments(); // Lấy lại danh sách bình luận sau khi đăng thành công
                    this.newComment.cmtContent = ''; // Xóa nội dung bình luận sau khi đăng
                }
            } catch (error) {
                this.$toast.error('Lỗi xảy ra trong quá trình đăng bình luận');
            }
        },
        async toggleEmotion(blogId, userId) {
            try {
                const response = await api.post(`/blog/${blogId}/emotion`, null, {
                    params: { userId: userId }
                });
                if (response.status === 200) {
                    this.blog.isLiked = response.data.isLiked;
                    this.blog.blogEmotionsNumber = response.data.blogEmotionsNumber;
                    this.$toast.success('Thay đổi trạng thái thả tim thành công!');
                } else {
                    this.$toast.error('Lỗi xảy ra trong quá trình thả tim');
                }
            } catch (error) {
                this.$toast.error('Lỗi xảy ra trong quá trình thả tim');
            }
        }
    },
    created() {
        this.fetchUserInfo();
        this.fetchBlogDetail();
        this.fetchComments();
    }

};
</script>

<style scoped>
.container {
    max-width: 800px;
    margin: auto;
    padding: 20px;
}

.img-fluid {
    max-width: 100%;
    height: 200px; /* Đặt chiều cao cố định cho ảnh */
    border-radius: 8px;
    cursor: pointer;
    object-fit: cover; /* Đảm bảo ảnh lấp đầy khung chứa mà không bị biến dạng */
}

.image-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr); /* 3 columns */
    gap: 10px;
}

.image-container {
    position: relative;
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

.comments-section {
    margin-top: 20px;
}

.comment-box {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 8px;
    margin-bottom: 10px;
}

.post-comment {
    margin-top: 20px;
}

.btn-primary {
    background-color: #007bff;
    border-color: #007bff;
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



