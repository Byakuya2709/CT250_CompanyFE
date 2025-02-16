<template>
    <div>
      <h2>{{ message }}</h2>
      <button @click="goToHome">Quay lại trang chủ</button>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        status: this.$route.query.status || "fail",
        message: this.$route.query.message || "Không có thông tin thanh toán"
      };
    },
    methods: {
      goToHome() {
        this.$router.push("/");
      }
    }
  };
  </script>
  