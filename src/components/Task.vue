<template>
  <div @click="goToTaskDetail" class="card task-card">
    <div class="card-body">
      <h5 class="card-title task-title">{{ task.title }}</h5>
      <hr />
      <p class="card-text task-description">{{ task.description }}</p>
      <hr />
      <div class="container task-details">
        <div class="row">
          <div class="col-6 text-right">
            <strong>Ngày tạo công việc:</strong>
            {{ formatDate(task.createdDate) }}
          </div>
          <div class="col-6 text-right">
            <strong>Ngày hoàn thành:</strong> {{ formatDate(task.date) }}
          </div>
          <div class="col-6 text-right">
            <strong>Lần cuối cập nhật:</strong>
            {{ formatDate(task.updatedDate) }}
          </div>

          <div class="col-6 text-left">
            <strong>Chịu trách nhiệm:</strong> {{ task.userName }}
          </div>
        </div>
        <div class="row mt-3">
          <div class="col-12 text-center">
            <span class="badge" :class="statusBadge">{{ task.status }}</span>
          </div>
        </div>
      </div>
      <hr />
      <div class="d-flex justify-content-center">
        <!-- Use @click.stop to prevent the click event from the parent div -->
        <button @click.stop="editTask" class="btn btn-custom-primary mx-2">
          Cập nhật
        </button>
        <!-- <button @click.stop="deleteTask" class="btn btn-custom-danger mx-2">
          Xóa
        </button> -->
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    task: {
      type: Object,
      required: true,
    },
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString();
    },
    editTask() {
      this.$emit("editTask", this.task);
    },
    // deleteTask() {
    //   this.$emit("deleteTask", this.task);
    // },
    goToTaskDetail() {
      this.$router.push({
        name: "TaskDetail",
        params: { taskId: this.task.id },
      });
    },
  },
  computed: {
    statusBadge() {
      return {
        "badge-success": this.task.status === "COMPLETED",
        "badge-warning": this.task.status === "PENDING",
        "badge-danger": this.task.status === "CANCELED",
        "badge-info": this.task.status === "IN_PROGRESS",
      };
    },
  },
};
</script>

<style scoped>
.task-card {
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  transition: box-shadow 0.3s ease;
}

.task-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.task-title {
  font-weight: bold;
  font-size: 1.5rem;
  color: #333;
}

.task-description {
  font-size: 1.1rem;
  color: #666;
}

.task-details {
  margin-top: 10px;
}

.badge {
  padding: 10px;
  font-size: 0.9rem;
  border-radius: 12px;
}

.badge-success {
  background-color: #28a745;
  color: white;
}

.badge-warning {
  background-color: #ffc107;
  color: white;
}

.badge-danger {
  background-color: #dc3545;
  color: white;
}
.badge-info {
  background-color: #418adf;
  color: white;
}

/* Custom button styling */
.btn-custom-primary,
.btn-custom-danger {
  width: 150px;
  padding: 10px 25px;
  font-size: 1rem;
  border-radius: 25px;
}

/* Custom primary button */
.btn-custom-primary {
  background: linear-gradient(135deg, #42a5f5, #1e88e5);
  color: white;
}

.btn-custom-primary:hover {
  background: linear-gradient(135deg, #1e88e5, #1565c0);
  transform: scale(1.05);
}

/* Custom danger button */
.btn-custom-danger {
  background: linear-gradient(135deg, #e53935, #d32f2f);
  color: white;
}

.btn-custom-danger:hover {
  background: linear-gradient(135deg, #d32f2f, #b71c1c);
  transform: scale(1.05);
}

/* Flex container and button spacing */
.d-flex {
  display: flex;
}

.justify-content-center {
  justify-content: center;
}

.mx-2 {
  margin-left: 0.5rem;
  margin-right: 0.5rem;
}
</style>
