<template>
  <div class="company-info">
    <h1>Thông Tin Công Ty</h1>

    <form @submit.prevent="updateCompanyInfo">
      <div v-if="company">
        <!-- Logo Công Ty -->
        <div class="logo-container">
          <img :src="previewLogo" alt="Logo Công Ty" class="logo" />
          <input type="file" @change="handleImageUpload" />
        </div>

        <!-- Mã Công Ty (không sửa) -->
        <p><strong>Mã Công Ty:</strong> {{ company.id }}</p>

        <!-- Tên Công Ty -->
        <label>Tên Công Ty:</label>
        <input v-model="company.companyName" type="text" required />

        <!-- Email Liên Lạc -->
        <label>Email Liên Lạc:</label>
        <input v-model="company.companyMail" type="email" required disabled />

        <!-- Số Điện Thoại -->
        <label>Số Điện Thoại:</label>
        <input v-model="company.companyPhone" type="tel" required />

        <!-- Địa Chỉ Trụ Sở -->
        <label>Địa Chỉ Trụ Sở:</label>
        <input v-model="company.companyAddress" type="text" required />

        <!-- Ngày Thành Lập -->
        <label>Ngày Thành Lập:</label>
        <p>
          {{ formatDate(company.publishDate) }}
        </p>
        <button type="submit">Lưu Thông Tin</button>
      </div>
      <p v-else>Đang tải dữ liệu...</p>
    </form>
  </div>
</template>

<script>
import { api } from "@/api/Api";
export default {
  name: "CompanyProfile",
  props: {
    userInfo: Object,
  },
  data() {
    return {
      company: { ...this.userInfo }, // Dữ liệu công ty
      logoFile: null, // File ảnh mới
      previewLogo: this.userInfo?.logoURL, // Giữ ảnh cũ ban đầu
    };
  },
  watch: {
    userInfo: {
      handler(newValue) {
        this.company = { ...newValue };
        this.previewLogo = newValue?.logoURL;
      },
      deep: true,
      immediate: true, // Cập nhật ngay khi component được mount
    },
  },
  methods: {
    async updateCompanyInfo() {
      try {
        // Nếu không có ảnh mới, bỏ qua việc upload logo
        if (this.logoFile) {
          const logoResponse = await this.uploadLogo();
          if (logoResponse?.data?.data?.imageUrl) {
            this.company.logoURL = logoResponse.data.data.imageUrl; // Cập nhật logo mới
          }
        }

        // Gửi dữ liệu cập nhật công ty
        await this.updateCompany();
      } catch (error) {
        console.log(error);
        this.$toast.error("Đã xảy ra lỗi khi lưu thông tin công ty.");
      }
    },
    async updateCompany() {
      try {
        const response = await api.patch("/companies", this.company);
        this.$toast.success(response.data.message);
      } catch (error) {
        console.log(error);
        this.$toast.error(error.response?.data?.message || "Đã xảy ra lỗi");
      }
    },
    handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        this.logoFile = file;
        reader.onload = (e) => {
          this.previewLogo = e.target.result; // Chỉ cập nhật ảnh xem trước
        };
        //
        reader.readAsDataURL(file);
      }
    },
    async uploadLogo() {
      const formData = new FormData();
      formData.append("file", this.logoFile);
      return await api.post("/media/upload", formData, {
        params: { accountId: this.company.id },
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    formatDate(isoString) {
      const date = new Date(isoString);
      return date.toLocaleDateString("vi-VN");
    },
  },
};
</script>

<style scoped>
.company-info {
  max-width: 500px;
  margin: auto;
  text-align: left;
  border: 1px solid #ccc;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
  background: #f9f9f9;
}
.logo-container {
  text-align: center;
  margin-bottom: 10px;
}
.logo {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: block;
  margin: auto;
}
input {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}
button {
  width: 100%;
  padding: 10px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
button:hover {
  background-color: #218838;
}
</style>
