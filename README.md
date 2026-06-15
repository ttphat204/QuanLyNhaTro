# 🏠 HỆ THỐNG QUẢN LÝ NHÀ TRỌ (Boarding House Management System)
> Dự án số hóa quy trình quản lý nhà trọ và căn hộ dịch vụ theo mô hình B2B2C SaaS Multi-Tenancy. Tự động tính hóa đơn, tích hợp mã QR động VietQR và hỗ trợ chat chăm sóc khách hàng thời gian thực.

---

## 🎯 Tính năng nổi bật

### 1. Phân quyền người dùng (RBAC - Multi-Tenancy)
Hệ thống được thiết kế chuyên biệt cho 4 nhóm người dùng, đảm bảo dữ liệu được cô lập hoàn toàn giữa các Chủ nhà (Landlords):
*   **Super Admin**: Quản lý hệ thống SaaS, kích hoạt/khóa tài khoản chủ nhà, theo dõi doanh thu gói phần mềm.
*   **Landlord (Chủ nhà)**: Quản lý tổng quan tài chính, cấu hình giá điện nước/dịch vụ theo từng Chi nhánh (Branch), phân quyền và quản lý nhân viên (Manager).
*   **Manager (Quản lý)**: Được phân quyền phụ trách một hoặc nhiều Chi nhánh cụ thể. Nhập chỉ số điện nước, làm hợp đồng, quản lý khách thuê và gửi hóa đơn.
*   **Tenant (Khách thuê)**: Xem chi tiết hóa đơn hàng tháng, theo dõi lịch sử thanh toán, gửi yêu cầu sửa chữa/bảo trì và chat trực tiếp với quản lý.

### 2. Tính tiền & Thanh toán thông minh (VietQR)
*   **Tự động hóa**: Hệ thống tính toán hóa đơn tự động dựa trên chỉ số điện nước cuối tháng, giá phòng và các gói dịch vụ phụ trợ.
*   **VietQR dynamic**: Tự động sinh mã QR thanh toán chuẩn Napas247 tương ứng với từng hóa đơn. Khách thuê chỉ cần dùng App ngân hàng quét mã, hệ thống sẽ tự động điền **đúng số tiền**, **đúng tài khoản thụ hưởng** và **mã đối soát chuyển khoản**.
*   **Hóa đơn điện tử**: Tự động tạo và lưu trữ hóa đơn dưới dạng cấu trúc khoa học, gửi thông báo trực tiếp qua hệ thống.

### 3. Tương tác thời gian thực (Socket.IO)
*   **Real-time Chat**: Phòng chat tích hợp giữa khách thuê và quản lý theo từng căn hộ/phòng trọ.
*   **Trạng thái hoạt động**: Hỗ trợ chỉ báo đang nhập chữ (typing indicator), hiển thị trạng thái online/offline của người dùng.
*   **Hệ thống thông báo (Notification)**: Gửi cảnh báo tức thời khi có hóa đơn mới, tin nhắn mới hoặc yêu cầu sửa chữa được cập nhật trạng thái.

### 4. Progressive Web App (PWA) & Trải nghiệm di động
*   Thiết kế giao diện tối ưu hóa cho di động (Mobile-First UX) thông qua thư viện Ant Design Grid.
*   Hỗ trợ PWA cho phép người dùng "cài đặt" ứng dụng trực tiếp lên màn hình điện thoại như một ứng dụng native.

---

## 🛠️ Stack công nghệ

### Backend
*   **Runtime:** Node.js (v18+) & Express.js
*   **Database:** MongoDB + Mongoose ORM
*   **Real-time:** Socket.IO
*   **Security:** Helmet.js, CORS, bcryptjs, JWT Authentication
*   **Task Scheduling:** node-cron (Tự động cập nhật hóa đơn quá hạn, gửi thông báo định kỳ)

### Frontend
*   **Framework:** React 18+ (Vite)
*   **UI Library:** Ant Design (antd v5)
*   **Routing:** React Router DOM
*   **HTTP Client:** Axios (Tích hợp interceptor xử lý API URL động)
*   **Charts:** Recharts (Vẽ biểu đồ doanh thu tài chính)
*   **Icons:** Ant Design Icons

---

## 🚀 Hướng dẫn cài đặt & Chạy dưới Local

### 1. Yêu cầu hệ thống
*   Đã cài đặt [Node.js](https://nodejs.org/) (Khuyên dùng v18 hoặc v20)
*   Có tài khoản [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) hoặc MongoDB chạy ở local.

### 2. Cài đặt Backend
Di chuyển vào thư mục `backend`, cài đặt thư viện và thiết lập môi trường:
```bash
cd backend
npm install
```

Tạo file `.env` dựa trên mẫu của `.env.example`:
```ini
PORT=5005
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
WEBHOOK_SECRET=your_webhook_secret

# SMTP cấu hình gửi Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM_NAME="Quản Lý Nhà Trọ"

# Cloudinary (Quản lý lưu trữ ảnh)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Khởi chạy cơ sở dữ liệu ban đầu (Tạo tài khoản demo):
```bash
npm run seed
```
*(Lệnh này tạo các tài khoản: Super Admin, Landlord, Manager, Tenant với mật khẩu mặc định `admin123`)*

Chạy Backend ở chế độ phát triển:
```bash
npm run dev
```

### 3. Cài đặt Frontend
Mở một cửa sổ terminal mới, di chuyển vào thư mục `frontend` và cài đặt:
```bash
cd frontend
npm install
```

Chạy Frontend dưới Local:
```bash
npm run dev
```
Ứng dụng sẽ được mở tại: `http://localhost:5173`

---

## ☁️ Hướng dẫn triển khai (Deployment)

### 1. Triển khai Backend (Render / Railway)
*   Đặt **Root Directory** là `backend`.
*   Cài đặt **Build Command**: `npm install`.
*   Cài đặt **Start Command**: `npm start`.
*   Cấu hình các biến môi trường trong file `.env` vào phần **Environment Variables** trên hosting của bạn.

### 2. Triển khai Frontend (Vercel)
*   Đặt **Root Directory** là `frontend`.
*   Thiết lập biến môi trường sau trong cài đặt của Vercel:
    *   `VITE_API_URL`: `<Link API Backend Online của bạn>` (ví dụ: `https://ten-api-cua-ban.onrender.com`).
*   Vercel sẽ tự động nhận diện file `vercel.json` để cấu hình Rewrite URL cho React Router.
