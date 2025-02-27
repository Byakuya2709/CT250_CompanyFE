<template>
  <div class="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
    <h2 class="text-xl font-semibold mb-4">Gửi yêu cầu phê duyệt sự kiện</h2>

    <form @submit.prevent="submitForm">
      <div class="mb-4">
        <label class="block font-medium">Công ty:</label>
        <input
          v-model="formData.subCompanyName"
          disabled
          class="w-full p-2 border rounded"
        />
      </div>

      <!-- Tiêu đề (Dropdown) -->
      <div class="mb-4">
        <label class="block font-medium">Tiêu đề:</label>
        <select
          v-model="formData.subSubject"
          @change="updateContent"
          class="w-full p-2 border rounded"
        >
          <option
            v-for="(content, subject) in subjectOptions"
            :key="subject"
            :value="subject"
          >
            {{ subject }}
          </option>
        </select>
      </div>

      <!-- Nội dung -->
      <div class="mb-4">
        <label class="block font-medium">Nội dung:</label>
        <textarea
          v-model="formData.subContent"
          rows="4"
          class="w-full p-2 border rounded"
          readonly
        ></textarea>
      </div>

      <!-- Nếu chọn "Yêu Cầu Cập Nhật Giá Sự Kiện" thì hiển thị ô nhập giá -->
      <div
        class="mb-4"
        v-if="formData.subSubject === 'Yêu Cầu Cập Nhật Giá Sự Kiện'"
      >
        <label class="block font-medium">Giá mới:</label>
        <input
          type="number"
          v-model="formData.subFormdata"
          class="w-full p-2 border rounded"
          min="0"
          step="1000"
          @input="validatePrice"
        />
        <p v-if="priceError" class="text-red-500 text-sm">
          {{ priceError }}
        </p>
      </div>

      <!-- Ngày tạo -->
      <div class="mb-4">
        <label class="block font-medium">Ngày tạo:</label>
        <input
          type="datetime-local"
          v-model="formData.subCreateDate"
          class="w-full p-2 border rounded"
          disabled
        />
      </div>

      <!-- Hạn chót -->
      <div class="mb-4">
        <label class="block font-medium">Hạn chót:</label>
        <input
          type="datetime-local"
          v-model="formData.subDeadline"
          :min="minDeadline"
          class="w-full p-2 border rounded"
        />
        <p v-if="deadlineError" class="text-red-500 text-sm">
          {{ deadlineError }}
        </p>
      </div>

      <!-- Nút gửi -->
      <button
        type="submit"
        class="btn btn-primary"
        :disabled="!!deadlineError || !!priceError"
      >
        Gửi yêu cầu
      </button>
    </form>

    <!-- Thông báo -->
    <p v-if="message" class="mt-4 text-green-600 font-semibold">
      {{ message }}
    </p>
  </div>
</template>

<script>
import { api } from "@/api/Api";

export default {
  props: {
    userInfo: Object,
  },
  data() {
    return {
      formData: {
        subSubject: "Yêu Cầu Hủy Bỏ Sự Kiện",
        subCreateDate: "",
        subFinishDate: null,
        subStatus: "PENDING",
        subDeadline: "",
        subContent: "",
        subCompanyId: this.$route.params.companyId,
        subCompanyName: this.userInfo?.companyName,
        subFormdata: 0, // Giá mới khi cập nhật
      },
      minDeadline: "",
      deadlineError: "",
      priceError: "",
      message: "",
      subjectOptions: {
        "Yêu Cầu Hủy Bỏ Sự Kiện":
          "Chúng tôi xin đề nghị hủy bỏ sự kiện do những yếu tố khách quan. Rất mong nhận được sự xem xét và phản hồi từ quý ban.",
        "Yêu Cầu Cập Nhật Giá Sự Kiện":
          "Chúng tôi xin đề xuất cập nhật giá sự kiện để phản ánh đúng tình hình thực tế. Mong quý ban xem xét và phê duyệt.",
      },
    };
  },
  watch: {
    userInfo: {
      handler(newValue) {
        this.formData.subCompanyName = newValue.companyName;
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    getCurrentDateTime() {
      const now = new Date();
      return now.toISOString().slice(0, 16);
    },
    getMinDeadline() {
      const now = new Date();
      now.setDate(now.getDate() + 2);
      now.setHours(0, 0, 0, 0);
      return now.toISOString().slice(0, 16);
    },
    validateDeadline() {
      if (this.formData.subDeadline < this.minDeadline) {
        this.formData.subDeadline = this.minDeadline;
        this.deadlineError =
          "Hạn chót đã được tự động điều chỉnh để đảm bảo hợp lệ.";
      } else {
        this.deadlineError = "";
      }
    },
    validatePrice() {
      if (this.formData.subSubject === "Yêu Cầu Cập Nhật Giá Sự Kiện") {
        if (!this.formData.subFormdata || this.formData.subFormdata <= 0) {
          this.priceError = "Giá mới phải lớn hơn 0.";
        } else {
          this.priceError = "";
        }
      }
    },
    updateContent() {
      this.formData.subContent =
        this.subjectOptions[this.formData.subSubject] || "";

      // Reset giá khi chuyển tiêu đề khác
      if (this.formData.subSubject !== "Yêu Cầu Cập Nhật Giá Sự Kiện") {
        this.formData.subFormdata = 0;
        this.priceError = "";
      }
    },
    async submitForm() {
      this.validateDeadline();
      this.validatePrice();
      if (this.deadlineError || this.priceError) return;

      try {
        const payload = { ...this.formData };
        console.log(payload);

        const response = await api.post(
          `submissions/${this.$route.params.eventId}`,
          payload
        );
        this.$toast.success(response.data.message);
      } catch (error) {
        this.$toast.error(error.message);
      }
    },
  },
  mounted() {
    this.formData.subCreateDate = this.getCurrentDateTime();
    this.minDeadline = this.getMinDeadline();
    this.formData.subDeadline = this.minDeadline;
    this.updateContent(); // Gán nội dung mặc định khi component mount
  },
};
</script>

<style scoped>
input,
textarea {
  border: 1px solid #ccc;
}
</style>
