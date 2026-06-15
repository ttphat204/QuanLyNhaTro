# 🏠 QuanLyNhaTro — Boarding House Management System

[![GitHub release](https://img.shields.io/badge/release-v1.0.0-blue.svg)](https://github.com/ttphat204/QuanLyNhaTro)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![Platform](https://img.shields.io/badge/platform-Web%20%7C%20PWA-orange.svg)](#)

> **Giải pháp số hóa toàn diện cho mô hình quản lý nhà trọ, chung cư mini và căn hộ dịch vụ B2B2C SaaS Multi-Tenancy.** Tích hợp thanh toán nhanh qua mã QR động VietQR và hỗ trợ chăm sóc khách hàng thời gian thực.

---

## 📖 Tổng quan dự án

Dự án **QuanLyNhaTro** được xây dựng nhằm giải quyết các khó khăn truyền thống của chủ nhà trọ và khách thuê bằng cách số hóa toàn bộ quy trình vận hành. 

Hệ thống cung cấp một nền tảng quản lý tập trung, minh bạch hóa các khoản chi phí (điện, nước, dịch vụ), tối ưu hóa thời gian đối soát dòng tiền thanh toán và nâng cao chất lượng kết nối giữa ban quản lý và cư dân.

### 🌟 Điểm nổi bật nhất của dự án:
*   **Mô hình Multi-Tenancy (B2B2C SaaS)**: Cho phép nhiều chủ nhà trọ (Landlord) sử dụng chung một hệ thống phần mềm nhưng dữ liệu được phân tách hoàn toàn độc lập, an toàn.
*   **Tích hợp VietQR thông minh**: Tự sinh mã QR thanh toán chuẩn Napas247 cho từng hóa đơn hàng tháng. Khách thuê quét mã chuyển khoản sẽ tự điền chính xác số tiền và mã hóa đơn đối soát tự động mà không cần nhập tay.
*   **Hỗ trợ giao tiếp Real-time**: Kênh tương tác tức thời (Chat & Notification) giúp giải quyết các yêu cầu sửa chữa, thông báo tiền phòng một cách nhanh chóng nhất.

---

## 🎯 Các tính năng chính

### 1. Phân quyền vai trò chi tiết (RBAC)
*   **Super Admin Portal**: Quản lý gói cước dịch vụ, cấp phép/khóa tài khoản chủ nhà, giám sát dòng tiền đăng ký hệ thống SaaS.
*   **Landlord Portal (Chủ trọ)**: Quản lý đa cơ sở (nhiều dãy trọ/chi nhánh), cấu hình đơn giá, phân công nhân viên và xem báo cáo tài chính trực quan.
*   **Manager Portal (Quản lý)**: Quản lý phòng, người thuê, lập hợp đồng, nhập chỉ số điện nước cuối tháng và gửi hóa đơn.
*   **Tenant Portal (Khách thuê)**: Giao diện tối ưu di động (Mobile-First UX) giúp theo dõi hóa đơn, lịch sử thanh toán, gửi sự cố bảo trì kèm hình ảnh.

### 2. Tự động hóa hóa đơn & Đối soát
*   Nhập chỉ số điện nước nhanh chóng, tự động tính tổng tiền phòng cùng các dịch vụ đi kèm.
*   Tự tạo mã QR động VietQR tương ứng chính xác số tiền phải đóng.
*   Lịch sử thanh toán chi tiết, cập nhật tức thời trạng thái hóa đơn (Đã thanh toán, Chưa thanh toán, Quá hạn).

### 3. Tương tác thời gian thực
*   Chat real-time tích hợp hiển thị trạng thái online/offline, chỉ báo đang soạn tin nhắn (typing indicator) và hỗ trợ gửi hình ảnh trực tiếp.
*   Hệ thống thông báo đẩy (Push & Email) nhắc nhở đóng tiền phòng trước kỳ hạn và cập nhật tiến độ xử lý yêu cầu sửa chữa.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

### Backend
*   ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![ExpressJS](https://img.shields.io/badge/express.js-%23000000.svg?style=for-the-badge&logo=express&logoColor=white)
*   ![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white) + Mongoose ORM
*   ![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&logoColor=white) (Real-time communication)
*   **Thư viện khác**: `jsonwebtoken` (JWT), `bcryptjs`, `nodemailer` (Email Service), `node-cron` (Task Scheduler).

### Frontend
*   ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361dafb) ![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
*   ![Ant-Design](https://img.shields.io/badge/-AntDesign-%230170FE?style=for-the-badge&logo=ant-design&logoColor=white) (Component Library)
*   ![Axios](https://img.shields.io/badge/axios-671ddf?style=for-the-badge&logo=axios&logoColor=white) (HTTP Client với API Interceptor động)
*   **Thư viện khác**: `recharts` (Biểu đồ thống kê doanh thu), `socket.io-client`.

---

## ⚙️ Hướng dẫn cài đặt (Getting Started)

### Yêu cầu hệ thống:
*   [Node.js](https://nodejs.org/) (Khuyên dùng phiên bản LTS mới nhất)
*   Cơ sở dữ liệu MongoDB (Local hoặc đám mây MongoDB Atlas)

### Các bước cài đặt:

1. **Clone repository về máy local:**
   ```bash
   git clone https://github.com/ttphat204/QuanLyNhaTro.git
   cd QuanLyNhaTro
   ```

2. **Cấu hình & khởi động Backend:**
   ```bash
   cd backend
   npm install
   ```
   *   Tạo file `.env` tại thư mục `/backend` tương tự như [.env.example](file:///e:/Antigraviry/QuanLyNhaTro/backend/.env.example) và điền các thông tin kết nối DB của bạn.
   *   Khởi tạo cơ sở dữ liệu mẫu bằng lệnh seed:
       ```bash
       npm run seed
       ```
   *   Khởi chạy server backend dưới local:
       ```bash
       npm run dev
       ```

3. **Cấu hình & khởi động Frontend:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
   *   Mở trình duyệt truy cập: `http://localhost:5173` để trải nghiệm dự án.

---

## 📈 Hướng dẫn triển khai (Deployment)

### Backend (Render / Railway)
*   **Root Directory**: `backend`
*   **Build Command**: `npm install`
*   **Start Command**: `npm start`
*   *Lưu ý*: Cấu hình đầy đủ các biến môi trường từ file `.env` vào phần quản lý Environment Variables của hosting.

### Frontend (Vercel)
*   **Root Directory**: `frontend`
*   *Lưu ý*: Cấu hình biến môi trường `VITE_API_URL` bằng đường dẫn API backend online của bạn (ví dụ: `https://ten-api-cua-ban.onrender.com`).

---

## 🤝 Đóng góp (Contributing)

Mọi đóng góp nhằm cải thiện dự án đều được chào đón! Quy trình đóng góp như sau:
1. Fork dự án này.
2. Tạo nhánh tính năng mới của bạn (`git checkout -b feature/AmazingFeature`).
3. Commit những thay đổi của bạn (`git commit -m 'Add some AmazingFeature'`).
4. Push lên nhánh vừa tạo (`git push origin feature/AmazingFeature`).
5. Mở một Pull Request để chúng tôi kiểm duyệt.

---

## 👤 Tác giả & Liên hệ

*   **Tác giả**: Trần Tấn Phát
*   **GitHub**: [@ttphat204](https://github.com/ttphat204)
*   **Email liên hệ**: trantanphat08012004@gmail.com
