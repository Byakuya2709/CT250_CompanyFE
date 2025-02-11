<template>
  <div class="event-container" v-if="event">
    <div class="event-header">
      <h1 class="event-title">{{ event.eventTitle }}</h1>
      <p v-for="(tag, index) in eventTags" :key="index" class="event-tags">
        {{ tag }}
      </p>

      <div class="stars">
        <span
          v-for="index in getStars(event).fullStars"
          :key="'full-' + index"
          class="star full-star"
        >
          ★
        </span>
        <span v-if="getStars(event).halfStars" class="star half-star">★</span>
        <span
          v-for="index in getStars(event).emptyStars"
          :key="'empty-' + index"
          class="star empty-star"
        >
          ★
        </span>
      </div>

      <p class="event-age-tag">{{ event.eventAgeTag }}</p>
    </div>

    <div class="event-content">
      <swiper
        v-if="event?.eventListImgURL?.length"
        :space-between="10"
        :slides-per-view="1"
        :loop="true"
        :autoplay="{ delay: 3000 }"
        class="event-image-carousel"
        navigation
      >
        <swiper-slide
          v-for="(image, index) in event.eventListImgURL"
          :key="index"
          class="event-image-slide"
        >
          <img :src="image" alt="Event Image" />
        </swiper-slide>
      </swiper>

      <div class="event-details">
        <h3>Event Details</h3>
        <p><strong>Start Date:</strong> {{ formattedStartDate }}</p>
        <p><strong>End Date:</strong> {{ formattedEndDate }}</p>
        <p><strong>Price:</strong> {{ event.eventPrice }} VND</p>
        <p><strong>Location:</strong> {{ event.eventAddress }}</p>
        <p><strong>Capacity:</strong> {{ event.eventCapacity }} people</p>
        <p><strong>Status:</strong> {{ event.eventStatus }}</p>
      </div>
    </div>

    <div class="event-descriptions">
      <h3>Mô tả sự kiện</h3>
      <p><strong>Description:</strong> {{ event.eventDescription }}</p>
    </div>

    <div class="event-tickets">
      <h3>Book Your Tickets</h3>
      <div class="ticket-list">
        <div
          v-for="(remainingCapacity, day) in event.eventTicketCapacity"
          :key="day"
          class="ticket-card"
        >
          <p>
            <strong>Day {{ day }}</strong>
          </p>
          <p>Remaining Tickets: {{ remainingCapacity }}</p>
          <button
            class="book-btn"
            @click="openModal({ day, remainingCapacity })"
          >
            Đặt vé ngay
          </button>
        </div>
        <div class="ticket-card">
          <p>
            <strong>ALL_DAY</strong>
          </p>
          <p>Tổng: {{ this.event.totalDay }} ngày </p>
          <!-- <p>Remaining Tickets: {{ totalRemainCapacity }}</p> -->
          <button class="book-btn" @click="openModalAllDay">
            Đặt vé toàn sự kiện
          </button>
        </div>
      </div>
    </div>

    <!-- Modal đặt vé -->
    <EventBooking
      v-if="showModal"
      :event="event"
      :day="selectedTicket"
      @close="closeModal"
    />
  </div>
  <EventBookingAllDay
    v-if="showModalAllDay"
    :event="event"
    :day="this.string"
    @close="closeModal"
  />
</template>

<script>
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/swiper-bundle.css";
import { api } from "@/api/Api";
import EventBooking from "@/views/EventView/EventBooking.vue";
import EventBookingAllDay from "@/views/EventView/EventBookingAllDay.vue";

export default {
  components: {
    Swiper,
    SwiperSlide,
    EventBooking,
    EventBookingAllDay,
  },
  data() {
    return {
      loading: true,
      eventId: this.$route.params.eventId,
      event: null,
      showModal: false,
      showModalAllDay: false,
      string: "ALL_DAYS",
      selectedTicket: null,
    };
  },
  async mounted() {
    await this.fetchEventData();

    if (this.$route.name === "EventBooking") {
      const dayQuery = this.$route.query.day;
      if (dayQuery) {
        this.selectedTicket = {
          day: dayQuery,
          remainingCapacity: this.event.eventTicketCapacity[dayQuery] || 0,
        };
      }
      this.showModal = true;
    }
  },
  watch: {
    async $route(to) {
      await this.fetchEventData();

      if (to.name === "EventBooking") {
        const dayQuery = to.query.day;
        if (dayQuery) {
          this.selectedTicket = {
            day: dayQuery,
            remainingCapacity: this.event.eventTicketCapacity[dayQuery] || 0,
          };
        }
        this.showModal = true;
      } else {
        this.showModal = false;
        this.selectedTicket = null;
      }
    },
  },
  methods: {
    async fetchEventData() {
      this.loading = true;
      try {
        const response = await api.get(`/events/${this.eventId}`);
        this.event = response.data.data;
      } catch (error) {
        console.error("Error fetching event data:", error);
      } finally {
        this.loading = false;
      }
    },
    openModal(ticket) {
      this.selectedTicket = ticket;
      this.showModal = true;

      // Điều hướng sang /events/:eventId/booking + ticketId
      this.$router.push({
        name: "EventBooking",
        params: { eventId: this.eventId },
        query: { day: ticket.day },
      });
    },
    openModalAllDay() {
      this.selectedTicket = {
        day: "ALL_DAY",
        remainingCapacity: this.totalRemainCapacity || 0,
      };
      this.showModalAllDay = true;

      this.$router.push({
        name: "EventBookingAllDay",
        params: { eventId: this.eventId },
        query: { day: "ALL_DAYS" },
      });
    },
    closeModal() {
      this.showModal = false;
      this.showModalAllDay = false;
      this.selectedTicket = null;

      // Quay lại trang event chính
      this.$router.push({ name: "EventDetails" });
    },
    calculateAverageRating(event) {
      let totalReviews = 0;
      let weightedSum = 0;

      // Loop through ratings to calculate the weighted sum
      for (let star in event.eventRatingStart) {
        let count = event.eventRatingStart[star];
        weightedSum += star * count;
        totalReviews += count;
      }

      // Return the average rating or 0 if no ratings
      return totalReviews === 0 ? 0 : weightedSum / totalReviews;
    },

    // Get full, half, and empty stars based on the average rating of an event
    getStars(event) {
      const averageRating = this.calculateAverageRating(event);
      const fullStars = Math.floor(averageRating); // Full stars
      const halfStars = averageRating % 1 >= 0.5 ? 1 : 0; // Half star if needed
      const emptyStars = 5 - fullStars - halfStars; // Empty stars

      return {
        fullStars,
        halfStars,
        emptyStars,
      };
    },
  },
  computed: {
    formattedStartDate() {
      return this.event?.eventStartDate
        ? new Date(this.event.eventStartDate).toLocaleString()
        : "";
    },
    formattedEndDate() {
      return this.event?.eventEndDate
        ? new Date(this.event.eventEndDate).toLocaleString()
        : "";
    },
    eventTags() {
      return this.event?.eventTags?.split("_") || [];
    },
    totalRemainCapacity() {
      if (!this.event?.eventTicketCapacity) return 0;
      return Math.min(
        ...Object.values(this.event.eventTicketCapacity).map(
          (capacity) => capacity || Infinity
        )
      );
    },
  },
};
</script>
<style scoped>
.event-container {
  width: 80%;
  margin: 0 auto;
  padding: 20px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

.event-header {
  text-align: center;
  background: #d32f2f;
  color: white;
  padding: 15px;
  border-radius: 8px 8px 0 0;
}

.event-title {
  font-size: 24px;
  font-weight: bold;
}

.event-tags,
.event-age-tag {
  display: inline-block;
  background: #222;
  color: white;
  padding: 5px 15px;
  margin: 5px;
  font-size: 14px;
  border-radius: 5px;
}

.event-content {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.event-details {
  flex: 1;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}

.event-details h3 {
  margin-bottom: 10px;
  color: #d32f2f;
}

.event-info p {
  font-size: 16px;
  margin: 10px 0;
}

.event-artists {
  margin-top: 20px;
  text-align: center;
}

.event-artists h3 {
  color: #d32f2f;
}

.artist-item {
  display: inline-block;
  background: #eeeeee;
  padding: 10px;
  margin: 5px;
  border-radius: 5px;
}

.event-tickets {
  margin-top: 20px;
  text-align: center;
}

.ticket-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.ticket-card {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 5px;
  text-align: center;
}

.book-btn {
  margin-top: 10px;
  padding: 8px 15px;
  background: #d32f2f;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 5px;
}

.book-btn:hover {
  background: #b71c1c;
}

.event-image-carousel {
  flex: 1;
  border-radius: 8px;
}

.event-image-slide img {
  width: 100%;
  height: auto;
  border-radius: 8px;
}

.swiper-button-prev,
.swiper-button-next {
  color: white;
  font-size: 20px;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  background: rgba(0, 0, 0, 0.7);
  padding: 10px;
  border-radius: 50%;
}

.swiper-button-prev {
  left: 10px;
}

.swiper-button-next {
  right: 10px;
}

.swiper-button-prev:hover,
.swiper-button-next:hover {
  background: rgba(0, 0, 0, 0.9);
}
.stars {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.star {
  font-size: 20px;
  color: #ffcc00;
  margin-right: 3px;
}

.full-star {
  color: #ffcc00;
}

.half-star {
  position: relative;
}

.empty-star {
  color: #e0e0e0;
}
</style>
