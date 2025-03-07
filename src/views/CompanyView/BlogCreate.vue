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
                <input type="file" id="blogImages" @change="handleImagesChange" accept="image/*" multiple class="form-control" />
                <div v-if="blogImages.length > 0" class="mt-2">
                    <h5>Hình ảnh đã chọn:</h5>
                    <div class="d-flex flex-wrap">
                        <div v-for="(image, index) in blogImages" :key="index" class="m-2">
                            <img :src="image" alt="Image Preview" class="img-thumbnail"
                                style="max-width: 100px; max-height: 100px; object-fit: cover" />
                            <button @click="removeImage(index)" class="btn btn-danger">Xóa</button>
                        </div>
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
                eventListImgURL: [],
            },
            blogImages: [],
            filesData: new FormData(),
        };
    },
    methods: {
        async uploadImages() {
            try {
                const formData = new FormData();
                this.filesData.getAll("files").forEach(file => {
                    formData.append("files", file);
                });
                formData.append("blogTitle", this.blog.blogSubject); // Thêm tiêu đề blog vào formData
                
                const response = await api.post("media/upload/blogs", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                
                return response;
            } catch (error) {
                console.error("Lỗi xảy ra trong quá trình tải lên ảnh: ", error.response || error);
                throw error;
            }
        },
        handleImagesChange(event) {
            const files = event.target.files;
            if (files.length === 0) {
                console.error('Không có file nào được chọn');
                return;
            }

            Array.from(files).forEach((file, index) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    if (e.target.result) {
                        this.blogImages.push(e.target.result);
                        this.filesData.append("files", file); // Thêm file gốc vào FormData
                    } else {
                        console.error('File reader không thể đọc ảnh này');
                    }
                };
                reader.onerror = (error) => {
                    console.error('Có lỗi xảy ra trong quá trình đọc file:', error);
                };
                reader.readAsDataURL(file);
            });
        },
        removeImage(index) {
            this.blogImages.splice(index, 1);
            const newFormData = new FormData();
            this.blogImages.forEach((_, i) => {
                const file = this.filesData.getAll("files")[i]; // Lấy file từ FormData gốc
                newFormData.append("files", file); // Thêm lại các file còn lại vào FormData mới
            });

            this.filesData = newFormData;
        },
        async uploadBlog() {
        try {
            const companyId = this.$route.params.companyId; // Lấy companyId từ URL

            if (!companyId) {
                this.$toast.error('Không tìm thấy companyId');
                return;
            }

            const formData = new FormData();
            formData.append("blogSubject", this.blog.blogSubject);
            formData.append("blogContent", this.blog.blogContent);

            // Upload images
            const imageResponse = await this.uploadImages();
            const eventListImgURL = imageResponse.data.data;

            eventListImgURL.forEach((value) => {
                formData.append("eventListImgURL[]", value);
            });

            const response = await api.post(`/blog/${companyId}/upload`, formData);
            if (response.data.status === 201) {
                this.$toast.success(response.data.message); // Hiển thị thông báo thành công
                this.$router.push(`/company/blog`); // Chuyển hướng đến trang /company/blog
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                this.$toast.error('Unauthorized: Vui lòng đăng nhập lại');
            } else {
                console.error('Lỗi xảy ra trong quá trình đăng bài:', error);
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

h2 {
    font-size: 32px; /* Thay đổi kích thước font chữ */
    font-weight: bold;
    color: #007bff; /* Thay đổi màu sắc chữ */
    text-align: center; /* Canh giữa */
    text-transform: uppercase; /* Viết hoa toàn bộ chữ */
    margin-bottom: 20px; /* Khoảng cách dưới */
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

