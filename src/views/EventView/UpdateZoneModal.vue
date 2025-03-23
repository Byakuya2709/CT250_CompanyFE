<!-- components/UpdateZoneModal.vue -->
<template>
  <div v-if="isModalOpen" class="modal-overlay">
    <div class="modal-container">
      <h2 style="color: black;">Cập nhật Vé</h2>
      <div v-if="firstDayZones" class="zone-group">
        <h3>Day {{ firstDay }}</h3>
        <table>
          <thead>
            <tr>
              <th>Khu Vực</th>
              <th>Tỉ giá x 100 (%)</th>
              <th>Số lượng vé</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(zone, index) in firstDayZones" :key="index">
              <td>{{ zone.zoneName }}</td>
              <td>
                <input
                  v-model.number="zone.zoneRate"
                  type="number"
                  step="0.1"
                />
              </td>
              <td>
                <input v-model.number="zone.zoneCapacity" type="number" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <button class="btn btn-primary mt-2" @click="submitUpdate">Cập nhật</button>
      <button class="btn btn-secondary mt-2 mx-2 " @click="closeModal">Đóng</button>
    </div>
  </div>
</template>

<script>
import { api } from "@/api/Api";

export default {
  props: {
    eventId: Number,
    isModalOpen: Boolean,
  },
  data() {
    return {
      zones: [],
    };
  },
  computed: {
    groupedZones() {
      return this.zones.reduce((acc, zone) => {
        if (!acc[zone.day]) acc[zone.day] = [];
        acc[zone.day].push(zone);
        return acc;
      }, {});
    },
    firstDay() {
      return Object.keys(this.groupedZones)[0] || null;
    },
    firstDayZones() {
      return this.groupedZones[this.firstDay] || [];
    },
  },
  watch: {
    isModalOpen(newVal) {
      if (newVal) this.fetchZones();
    },
  },
  methods: {
    async fetchZones() {
      try {
        const response = await api.get(`/events/zones/${this.eventId}`);
        this.zones = response.data.data;
        this.$toast.success(response.data.message);
      } catch (error) {
        console.error("Error fetching zones:", error);
      }
    },
    async submitUpdate() {
      const updatedData = this.firstDayZones.map(
        ({ zoneName, zoneRate, zoneCapacity }) => ({
          zoneName,
          zoneRate,
          zoneCapacity,
        })
      );

      try {
        const response = await api.patch(
          `/events/zones/${this.eventId}`,
          updatedData
        );
        this.$toast.success(response.data.message);
        this.$emit("close");
      } catch (error) {
        this.$toast.error(error.response?.data?.message || "Đã xảy ra lỗi");
        console.error("Error updating zones:", error);
      }
    },
    closeModal() {
      this.$emit("close");
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  z-index: 1000;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th {
  color: black !important;
}

td {
  border: 1px solid black;
  padding: 8px;
  color: black;
}
</style>
