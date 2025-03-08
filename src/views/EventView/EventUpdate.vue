<template>
  <div
    class="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg grid grid-cols-2 gap-6"
  >
    <!-- Form bên trái -->
    <div>
      <h2 class="text-xl font-semibold mb-4 text-center">
        Gửi yêu cầu phê duyệt sự kiện
      </h2>
      <form @submit.prevent="submitForm" class="space-y-4">
        <div>
          <label class="block font-medium">Công ty:</label>
          <input
            v-model="formData.subCompanyName"
            disabled
            class="w-full p-2 border rounded bg-gray-100"
          />
        </div>

        <div>
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

        <div>
          <label class="block font-medium">Nội dung:</label>
          <textarea
            v-model="formData.subContent"
            rows="4"
            class="w-full p-2 border rounded"
          ></textarea>
        </div>

        <div v-if="formData.subSubject === 'Yêu Cầu Cập Nhật Giá Sự Kiện'">
          <label class="block font-medium">Giá mới:</label>
          <input
            type="number"
            v-model="formData.subFormdata"
            class="w-full p-2 border rounded"
            min="0"
            step="1000"
            @input="validatePrice"
          />
          <p v-if="priceError" class="text-red-500 text-sm">{{ priceError }}</p>
        </div>

        <div>
          <label class="block font-medium">Ngày tạo:</label>
          <input
            type="datetime-local"
            v-model="formData.subCreateDate"
            class="w-full p-2 border rounded bg-gray-100"
            disabled
          />
        </div>

        <div>
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

        <button
          type="submit"
          class="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          :disabled="!!deadlineError || !!priceError"
        >
          Gửi yêu cầu
        </button>
      </form>
      <p v-if="message" class="mt-4 text-green-600 font-semibold">
        {{ message }}
      </p>
    </div>

    <!-- Event bên phải -->
    <div class="p-4 bg-gray-100 rounded-lg shadow-md">
      <EventCard :event="event" />
    </div>
  </div>
</template>

<script>
import { api } from "@/api/Api";
import EventCard from "@/components/EventCard.vue";
export default {
  props: {
    userInfo: Object,
  },
  components: {
    EventCard,
  },
  data() {
    return {
      event: {},
      formData: {
        subSubject: "Yêu Cầu Hủy Bỏ Sự Kiện",
        subCreateDate: "",
        subFinishDate: null,
        subStatus: "PENDING",
        subDeadline: "",
        subContent: "",
        subCompanyId: this.$route.params.companyId,
        subCompanyName: this.userInfo?.companyName,
        subFormdata: 0,
      },
      minDeadline: "",
      deadlineError: "",
      priceError: "",
      message: "",
      subjectOptions: {
        "Yêu Cầu Hủy Bỏ Sự Kiện":
          "Chúng tôi xin đề nghị hủy bỏ sự kiện do những yếu tố khách quan.",
        "Yêu Cầu Cập Nhật Giá Sự Kiện":
          "Chúng tôi xin đề xuất cập nhật giá sự kiện để phản ánh đúng tình hình thực tế.",
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
      return new Date().toISOString().slice(0, 16);
    },
    getMinDeadline() {
      const now = new Date();
      now.setDate(now.getDate() + 2);
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
      if (
        this.formData.subSubject === "Yêu Cầu Cập Nhật Giá Sự Kiện" &&
        (!this.formData.subFormdata || this.formData.subFormdata <= 0)
      ) {
        this.priceError = "Giá mới phải lớn hơn 0.";
      } else {
        this.priceError = "";
      }
    },
    updateContent() {
      this.formData.subContent =
        this.subjectOptions[this.formData.subSubject] || "";
      if (this.formData.subSubject !== "Yêu Cầu Cập Nhật Giá Sự Kiện") {
        this.formData.subFormdata = 0;
        this.priceError = "";
      }
    },
    async fetchEventData() {
      try {
        const response = await api.get(`/events/${this.$route.params.eventId}`);
        this.event = response.data.data;
      } catch (error) {
        this.$toast.error(error.response?.data?.message || "Đã xảy ra lỗi");
      }
    },
    async submitForm() {
      this.validateDeadline();
      this.validatePrice();
      if (this.deadlineError || this.priceError) return;

      try {
        const response = await api.post(
          `/submissions/${this.$route.params.eventId}`,
          this.formData
        );
        this.$toast.success(response.data.message);
      } catch (error) {
        this.$toast.error(error.message);
      }
    },
  },
  async mounted() {
    this.formData.subCreateDate = this.getCurrentDateTime();
    this.minDeadline = this.getMinDeadline();
    this.formData.subDeadline = this.minDeadline;
    this.updateContent();
    await this.fetchEventData();
  },
};
</script>

<style scoped>
input,
textarea {
  border: 1px solid #ccc;
}
</style>
