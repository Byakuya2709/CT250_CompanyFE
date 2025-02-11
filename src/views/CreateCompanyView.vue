<template>
  <div>
    <form @submit.prevent="submitForm">
      <!-- Company Logo Upload -->
      <div class="logo-container">
        <label for="logo">Logo Công Ty:</label>
        <input type="file" id="logo" @change="handleFileChange" />
        <div v-if="previewImage" class="preview">
          <img :src="previewImage" alt="Preview Logo" class="logo-preview" />
        </div>
        <span v-if="errors.logoFile" class="error">{{ errors.logoFile }}</span>
      </div>

      <!-- Company Information -->
      <label for="companyName">Tên Công Ty:</label>
      <input
        type="text"
        id="companyName"
        v-model="company.companyName"
        :class="{ invalid: errors.companyName }"
        @blur="validateField('companyName')"
      />
      <label for="companyMail">Email Công Ty:</label>
      <input
        type="email"
        id="companyMail"
        v-model="company.companyMail"
        readonly
      />

      <span v-if="errors.companyName" class="error">{{
        errors.companyName
      }}</span>

      <label for="companyPhone">Số Điện Thoại:</label>
      <input
        type="text"
        id="companyPhone"
        v-model="company.companyPhone"
        :class="{ invalid: errors.companyPhone }"
        @blur="validateField('companyPhone')"
      />
      <span v-if="errors.companyPhone" class="error">{{
        errors.companyPhone
      }}</span>

      <label for="companyAddress">Địa Chỉ:</label>
      <input
        type="text"
        id="companyAddress"
        v-model="company.companyAddress"
        :class="{ invalid: errors.companyAddress }"
        @blur="validateField('companyAddress')"
      />
      <span v-if="errors.companyAddress" class="error">{{
        errors.companyAddress
      }}</span>

      <label for="publishDate">Ngày Thành Lập:</label>
      <input
        type="date"
        id="publishDate"
        v-model="company.publishDate"
        :class="{ invalid: errors.publishDate }"
        @blur="validateField('publishDate')"
      />
      <span v-if="errors.publishDate" class="error">{{
        errors.publishDate
      }}</span>

      <button type="submit">Lưu Thông Tin Công Ty</button>
    </form>
  </div>
</template>

<script>
import { api } from "../api/Api";
export default {
  data() {
    return {
      company: {
        companyName: "",
        companyMail: sessionStorage.getItem("email") || "",
        companyPhone: "",
        companyAddress: "",
        logoURL: null,
        publishDate: "",
      },
      logoFile: null,
      previewImage: null,
      errors: {
        companyName: "",
        companyPhone: "",
        companyAddress: "",
        publishDate: "",
        logoFile: "",
      },
    };
  },
  methods: {
    handleFileChange(event) {
      const file = event.target.files[0];
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (file) {
        if (!allowedTypes.includes(file.type)) {
          this.errors.logoFile =
            "Chỉ hỗ trợ các tệp hình ảnh (JPEG, PNG, GIF).";
          this.logoFile = null;
          this.previewImage = null;
        } else if (file.size > maxSize) {
          this.errors.logoFile = "Kích thước tệp không được vượt quá 5MB.";
          this.logoFile = null;
          this.previewImage = null;
        } else {
          this.errors.logoFile = "";
          this.logoFile = file;

          const reader = new FileReader();
          reader.onload = (e) => {
            this.previewImage = e.target.result;
          };
          reader.readAsDataURL(file);
        }
      }
    },
    validateField(field) {
      if (field === "companyName" && !this.company.companyName.trim()) {
        this.errors.companyName = "Tên công ty không được để trống.";
      } else if (
        field === "companyPhone" &&
        !/^\d{10}$/.test(this.company.companyPhone)
      ) {
        this.errors.companyPhone =
          "Số điện thoại không hợp lệ (phải gồm 10 chữ số).";
      } else if (
        field === "companyAddress" &&
        !this.company.companyAddress.trim()
      ) {
        this.errors.companyAddress = "Địa chỉ không được để trống.";
      } else if (field === "publishDate" && !this.company.publishDate) {
        this.errors.publishDate = "Ngày thành lập không được để trống.";
      } else {
        this.errors[field] = "";
      }
    },
    async submitForm() {
      for (const field in this.company) {
        if (field !== "logoURL" && field !== "companyMail") {
          this.validateField(field);
        }
      }

      if (Object.values(this.errors).some((error) => error)) {
        this.$toast.error("Vui lòng kiểm tra lại các trường nhập liệu.");
        return;
      }

      try {
        const logoResponse = await this.uploadLogo();

        if (logoResponse.data.data.imageUrl) {
          this.company.logoURL = logoResponse.data.data.imageUrl;
          await this.createCompany();
        }
      } catch (error) {
        this.$toast.error(
          "Đã xảy ra lỗi khi tải lên logo hoặc lưu thông tin công ty."
        );
      }
    },
    async uploadLogo() {
      const formData = new FormData();
      formData.append("file", this.logoFile);
      return await api.post("/media/upload", formData, {
        params: { accountId: this.$route.query.accountId },
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    async createCompany() {
      try {
        const response = await api.post("/companies/create", this.company, {
          params: { accountId: this.$route.query.accountId },
        });
        this.$toast.success(response.data.message);
      } catch (error) {
        this.$toast.error(error.response?.data?.message || "Đã xảy ra lỗi");
      }
    },
  },
};
</script>

<style scoped>
form {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

label {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 5px;
  display: block;
}

input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

input.invalid {
  border-color: red;
}

.error {
  color: red;
  font-size: 12px;
  margin-bottom: 10px;
}

button[type="submit"] {
  width: 100%;
  padding: 12px;
  background-color: #007bff;
  color: white;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button[type="submit"]:hover {
  background-color: #0056b3;
}

.logo-container {
  text-align: center;
  margin-bottom: 20px;
}

.preview img {
  max-width: 120px;
  max-height: 120px;
  border-radius: 4px;
  margin-top: 10px;
  border: 2px solid #ccc;
}
</style>
