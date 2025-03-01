<template>
  <div :class="['card shadow-sm text-center p-3', color]">
    <font-awesome-icon :icon="icon" class="icon" />
    <p class="fw-semibold mt-2">{{ label }}</p>
    <h3 class="fw-bold">{{ value }}</h3>
  </div>
</template>

<script>
export default {
  props: {
    icon: String,
    label: String,
    value: [String, Number],
    color: String,
  },
};
</script>

<style scoped>
.card {
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.3s;
}

.card:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.icon {
  font-size: 2.5rem;
  margin-bottom: 10px;
}
</style>
