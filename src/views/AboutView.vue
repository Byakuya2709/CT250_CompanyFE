<template>
  <div
    class="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6"
  >
    <div class="max-w-4xl w-full bg-white shadow-lg rounded-2xl p-8">
      <h1 class="text-3xl font-bold text-gray-800 text-center mb-6">
        Nền Tảng Bán Vé Sự Kiện
      </h1>

      <p class="text-lg text-gray-600 text-center mb-4">
        Giúp bạn tổ chức sự kiện dễ dàng, quản lý vé chuyên nghiệp và tiếp cận
        hàng ngàn người tham gia.
      </p>

      <div class="grid md:grid-cols-3 gap-6 mt-6">
        <div class="p-4 border rounded-lg shadow-md text-center bg-blue-100">
          <h2 class="text-xl font-semibold text-blue-800">Tạo Sự Kiện</h2>
          <p class="text-gray-600 mt-2">
            Đăng ký sự kiện của bạn nhanh chóng chỉ với vài bước.
          </p>
        </div>
        <div class="p-4 border rounded-lg shadow-md text-center bg-green-100">
          <h2 class="text-xl font-semibold text-green-800">Quản Lý Vé</h2>
          <p class="text-gray-600 mt-2">
            Theo dõi và kiểm soát số lượng vé bán ra.
          </p>
        </div>
        <div class="p-4 border rounded-lg shadow-md text-center bg-yellow-100">
          <h2 class="text-xl font-semibold text-yellow-800">
            Tiếp Cận Khách Hàng
          </h2>
          <p class="text-gray-600 mt-2">Quảng bá sự kiện đến đúng đối tượng.</p>
        </div>
      </div>

      <div class="mt-8">
        <h2 class="text-2xl font-bold text-gray-800 text-center">
          Tính Năng Nổi Bật
        </h2>
        <ul class="mt-4 space-y-3 text-gray-700 text-lg">
          <li>✔️ Thanh Toán Online</li>
          <li>✔️ Giao diện dễ sử dụng và tối ưu cho di động</li>
          <li>✔️ Giao diện đơn giản dễ dàng sử dụng</li>
        </ul>
      </div>

      <div class="mt-8 flex justify-center">
        <!-- <router-link to="/company/login" class="px-6 py-3 bg-blue-600 text-white rounded-lg text-lg font-medium hover:bg-blue-700 transition">
          Bắt đầu ngay
        </router-link> -->
      </div>

      <div class="mt-12 text-center text-gray-600 text-sm">
        <p>© 2025 Nền Tảng Bán Vé Sự Kiện. Mọi quyền được bảo lưu.</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "About",
};
</script>

<style></style>
