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
      <!-- Tiêu đề -->
      <div class="mb-4">
        <label class="block font-medium">Tiêu đề:</label>
        <input
          v-model="formData.subSubject"
          class="w-full p-2 border rounded"
        />
      </div>

      <!-- Nội dung -->
      <div class="mb-4">
        <label class="block font-medium">Nội dung:</label>
        <textarea
          v-model="formData.subContent"
          rows="4"
          class="w-full p-2 border rounded"
        ></textarea>
      </div>

      <!-- Ngày tạo (tự động lấy ngày hiện tại) -->
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

      <!-- Công ty -->

      <!-- Nút gửi -->
      <button type="submit" class="btn btn-primary" :disabled="!!deadlineError">
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
        subSubject: "Tường trình đề nghị phê duyệt sự kiện",
        subCreateDate: "", // Sẽ được cập nhật khi component được tạo
        subFinishDate: null,
        subStatus: "PENDING",
        subDeadline: "", // Cập nhật hạn chót khi component mount
        subContent:
          "Chúng tôi kính trình lên ban quản trị đề nghị phê duyệt sự kiện theo kế hoạch đã đề xuất. Kính mong nhận được sự xem xét và phê duyệt từ quý ban.",
        subCompanyId: this.$route.params.companyId,
        subCompanyName: this.userInfo?.companyName,
      },
      minDeadline: "", // Giá trị hạn chót tối thiểu (+2 ngày từ ngày tạo)
      deadlineError: "",
      message: "",
    };
  },
  watch: {
    userInfo: {
      handler(newValue) {
        this.formData.subCompanyName = newValue.companyName;
      },
      deep: true,
      immediate: true, // Cập nhật ngay khi component được mount
    },
  },
  methods: {
    getCurrentDateTime() {
      const now = new Date();
      return now.toISOString().slice(0, 16); // Định dạng YYYY-MM-DDTHH:mm
    },
    getMinDeadline() {
      const now = new Date();
      now.setDate(now.getDate() + 2); // Cộng thêm 2 ngày
      now.setHours(0, 0, 0, 0); // Đặt thời gian về 00:00
      return now.toISOString().slice(0, 16);
    },
    validateDeadline() {
      if (this.formData.subDeadline < this.minDeadline) {
        this.formData.subDeadline = this.minDeadline; // Cập nhật deadline hợp lệ
        this.deadlineError =
          "Hạn chót đã được tự động điều chỉnh để đảm bảo hợp lệ.";
      } else {
        this.deadlineError = "";
      }
    },
    async submitForm() {
      this.validateDeadline();
      if (this.deadlineError) return;
      console.log(this.formData);
      try {
        const response = await api.post(
          `submissions/${this.$route.params.eventId}/create`,
          this.formData
        );
        this.$toast.success(response.data.message);
      } catch (error) {
        this.$toast.error(error.message);
      }
    },
  },
  mounted() {
    this.formData.subCreateDate = this.getCurrentDateTime(); // Gán ngày tạo
    this.minDeadline = this.getMinDeadline(); // Gán hạn chót tối thiểu
    this.formData.subDeadline = this.minDeadline; // Mặc định hạn chót = minDeadline
  },
};
</script>

<style scoped>
input,
textarea {
  border: 1px solid #ccc;
}
</style>
