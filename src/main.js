import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";

import { library, dom } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { fas } from '@fortawesome/free-solid-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
library.add(fas, far, fab);
dom.watch();
import storePlugin from './plugins/store';
import { jwtDecode } from 'jwt-decode';  // Sử dụng thư viện jwt-decode
import { removeAuthorization, setAuthorization } from "./api/Api";

// Importing necessary Chart.js components (if needed globally)
// import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

// // Register Chart.js components globally
// ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

import ToastPlugin from '@/plugins/toast';

// Kiểm tra token và xử lý khi ứng dụng khởi tạo
const app = createApp(App);
const token = localStorage.getItem('token');

if (token) {
  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000); // Thời gian hiện tại (tính bằng giây)

    // Kiểm tra xem token đã hết hạn chưa
    if (decodedToken.exp < currentTime) {
      console.log("Token has expired. Logging out...");
      localStorage.removeItem('token');
      removeAuthorization();
      router.push('/login'); // Redirect to login page
    } else {
      setAuthorization(token); // Set the authorization header
    }
  } catch (error) {
    console.error("Error decoding token:", error);
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    removeAuthorization();
  }
} else {
  router.push('/login');
}

app.use(Toast, {
  position: "top-right",
  timeout: 4000,
  closeOnClick: true,
});
import VueKonva from 'vue-konva';
app.use(VueKonva)

app.use(ToastPlugin);
app.use(createPinia());
app.use(router);
app.use(storePlugin);
app.component("font-awesome-icon", FontAwesomeIcon);
app.mount('#app');
