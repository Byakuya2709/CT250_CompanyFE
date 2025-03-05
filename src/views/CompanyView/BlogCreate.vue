<template>
    <div class="container">
        <h2>Đăng bài viết mới</h2>
        <form @submit.prevent="uploadBlog" enctype="multipart/form-data">
            <div class="form-group">
                <label for="subject">Chủ đề</label>
                <input type="text" id="subject" v-model="blog.blogSubject" class="form-control" required />
            </div>
            <div class="form-group">
                <label for="content">Nội dung</label>
                <textarea id="content" v-model="blog.blogContent" class="form-control" required></textarea>
            </div>
            <div class="form-group">
                <label for="files">Tệp ảnh</label>
                <input type="file" id="blogThumbnails" @change="handleThumbnailChange" accept="image/*" multiple class="form-control" />
                <div v-if="blogThumbnailsResult.length" class="mt-2">
                    <div v-for="(thumb, index) in blogThumbnailsResult" :key="index" class="d-inline-block position-relative mr-2">
                        <img :src="thumb" alt="Blog" class="img-fluid" style="max-width: 200px; border-radius: 8px" />
                        <button @click="removeThumbnail(index)" class="btn btn-danger btn-sm position-absolute" style="top: 5px; right: 5px;">X</button>
                    </div>
                </div>
            </div>
            <button type="submit" class="btn btn-primary">Đăng bài</button>
        </form>
    </div>
</template>
<script>
import { api } from "@/api/Api"; // Sử dụng API từ api/Api.js

export default {
    data() {
        return {
            blog: {
                blogSubject: '',
                blogContent: '',
            },
            blogThumbnailsUrl: [],
            blogThumbnailsResult: [],
        };
    },
    methods: {
        async fetchBlogDetail() {
            try {
                const { blogId } = this.$route.params; // Lấy blogId từ URL
                const response = await api.get(`/blog/${blogId}`);
                if (response.status === 200) {
                    console.log('Blog data:', response.data.data);
                    this.blog = response.data.data;
                    console.log('Event List Image URLs:', this.blog.eventListImgURL); // Thêm dòng này để kiểm tra
                }
            } catch (error) {
                console.error('Error fetching blog detail:', error);
                this.$toast.error('Lỗi xảy ra trong quá trình lấy thông tin bài viết');
            }
        },

        async uploadThumbnails() {
            const uploadPromises = this.blogThumbnailsUrl.map(file => {
                const formData = new FormData();
                formData.append("file", file);
                return api.post("/media/upload/blog/thumbnail", formData, {
                    params: { blogSubject: this.blog.blogSubject },
                    headers: { "Content-Type": "multipart/form-data" },
                });
            });
            return await Promise.all(uploadPromises);
        },
        handleThumbnailChange(event) {
            const files = event.target.files;
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const reader = new FileReader();
                console.log('Thumbnail added:', file);
                reader.onload = (e) => {
                    this.blogThumbnailsUrl.push(file);
                    this.blogThumbnailsResult.push(e.target.result);
                };
                reader.readAsDataURL(file);
            }
        },
        removeThumbnail(index) {
            this.blogThumbnailsUrl.splice(index, 1);
            this.blogThumbnailsResult.splice(index, 1);
        },
        async uploadBlog() {
            try {
                const companyId = this.$route.params.companyId; // Lấy companyId từ URL
                console.log('companyId:', companyId); // Kiểm tra giá trị companyId

                if (!companyId) {
                    this.$toast.error('Không tìm thấy companyId');
                    return;
                }

                const formData = new FormData();
                formData.append("blogSubject", this.blog.blogSubject);
                formData.append("blogContent", this.blog.blogContent);

                // Upload thumbnails
                const thumbnailResponses = await this.uploadThumbnails();
                let eventListImgURL = thumbnailResponses.map(response => response.data.data.imageUrl);

                eventListImgURL.forEach((value) => {
                    formData.append("eventListImgURL[]", value);
                });

                console.log("Form data", formData.get("eventListImgURL"));

                const response = await api.post(`/blog/${companyId}/upload`, formData);
                console.log(response);
                if (response.data.status === 201) {
                    this.$toast.success(response.data.message); // Hiển thị thông báo thành công
                    this.$router.push('/'); // Điều hướng về trang chủ hoặc trang khác
                }
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    this.$toast.error('Unauthorized: Vui lòng đăng nhập lại');
                } else {
                    console.log("error", error);
                    this.$toast.error('Lỗi xảy ra trong quá trình đăng bài');
                }
            }
        }
    }
};
</script>
<style scoped>
.container {
    max-width: 600px;
    margin: auto;
    padding: 20px;
}

.form-group {
    margin-bottom: 15px;
}

.btn-primary {
    background-color: #007bff;
    border-color: #007bff;
}

.position-relative {
    position: relative;
}

.btn-danger {
    padding: 0.2rem 0.5rem;
    font-size: 0.8rem;
}
</style>
