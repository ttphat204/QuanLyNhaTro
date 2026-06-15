# 🏠 DỰ ÁN: HỆ THỐNG QUẢN LÝ NHÀ TRỌ (Boarding House Management System)

## 📋 TỔNG QUAN DỰ ÁN
**Mục tiêu:** Xây dựng hệ thống web quản lý nhà trọ với đầy đủ tính năng số hóa, quản lý người thuê, tính tiền điện nước, thanh toán online và chat real-time.

## 🎯 TÍNH NĂNG CHÍNH

### **A. Quản lý cơ bản:**
1. **Quản lý Phòng** - CRUD phòng, trạng thái (trống/đang thuê)
2. **Quản lý Người thuê** - Thông tin cá nhân, CCCD, hợp đồng, ảnh
3. **Quản lý Hợp đồng** - Lưu trữ file scan, thời hạn
4. **Nhập chỉ số điện nước** hàng tháng

### **B. Tính tiền & Thanh toán:**
1. **Tự động tính toán** tiền phòng + điện + nước
2. **Tạo hóa đơn điện tử** tự động
3. **Thanh toán online** tích hợp VNPay/Momo
4. **QR Code thanh toán (VietQR)** - Tạo QR cho từng hóa đơn, khách quét QR từ app ngân hàng, tự điền đúng số tiền + nội dung chuyển khoản
5. **Webhook ngân hàng** - Nhận callback tự động xác nhận thanh toán
6. **Gửi email/SMS** thông báo hóa đơn

### **C. Chat Real-time:**
1. **Chat giữa chủ trọ - người thuê**
2. **Typing indicator, online status**
3. **Gửi file/ảnh** trong chat
4. **Phòng chat theo từng phòng trọ**

### **D. Phân quyền B2B2C SaaS (RBAC):**
- **SUPER_ADMIN** - Chủ nền tảng phần mềm. Quản lý các tài khoản ChuNha (Landlord), thu phí phần mềm.
- **LANDLORD (ChuNha)** - Chủ nhà trọ. Khách hàng mua gói phần mềm. Quản lý toàn bộ dãy trọ, phòng, khách thuê, hóa đơn của riêng họ. (Dữ liệu tách biệt hoàn toàn với ChuNha khác theo mô hình Multi-tenant).
- **MANAGER** - Quản lý (được ChuNha phân quyền). Có thể được gán quản lý theo từng **Khu vực/Chi nhánh (Area/Branch)** cụ thể.
- **TENANT** - Người thuê. Trực thuộc 1 ChuNha. Chỉ xem thông tin của mình và thanh toán cho ChuNha đó.
- **GUEST** - Xem phòng trống (Landing page)

### **E. 📊 Dashboard Thống Kê Trực Quan:**
1. **Tổng doanh thu** tháng / quý / năm (biểu đồ cột, đường)
2. **Tỷ lệ lấp đầy phòng** (%) - biểu đồ tròn
3. **Danh sách hóa đơn chưa thanh toán** - cảnh báo nợ
4. **Phòng sắp hết hợp đồng** (30 ngày tới)
5. **So sánh doanh thu** giữa các tháng
6. **Tổng quan nhanh**: số phòng trống, số khách thuê, doanh thu tháng này

### **F. 🔔 Hệ Thống Nhắc Nhở Thông Minh:**
1. **Nhắc đóng tiền** trước 3-5 ngày (qua app + email)
2. **Nhắc hợp đồng sắp hết hạn** (trước 30 ngày)
3. **Nhắc chủ trọ nhập chỉ số điện nước** đầu tháng
4. **Cảnh báo khách nợ** > 2 tháng
5. **Thông báo khi có sự thay đổi** về giá điện nước

### **G. 🛠️ Quản Lý Sửa Chữa / Bảo Trì:**
1. **Khách gửi yêu cầu sửa chữa** (kèm ảnh mô tả)
2. **Chủ trọ xác nhận** → phân công → theo dõi tiến độ → hoàn thành
3. **Lịch sử bảo trì** theo từng phòng
4. **Chi phí sửa chữa** → tính vào báo cáo tài chính

### **H. 📸 Chụp Ảnh Chỉ Số Điện Nước + OCR:**
1. **Chụp ảnh đồng hồ** điện/nước bằng điện thoại
2. **AI OCR tự nhận diện số** → tự điền vào form (Google Cloud Vision / Tesseract.js)
3. **Lưu ảnh làm bằng chứng** (tránh tranh chấp với khách thuê)

### **I. 📋 Hợp Đồng Điện Tử (E-Contract):**
1. **Tạo hợp đồng từ template** có sẵn
2. **Ký điện tử** (chữ ký tay trên màn hình)
3. **Lưu trữ bản PDF** có mã xác thực
4. **Gửi email** bản hợp đồng cho cả hai bên

### **J. 💰 Quản Lý Thu Chi Toàn Diện:**
1. **Thu**: tiền phòng, điện, nước, dịch vụ khác
2. **Chi**: sửa chữa, bảo trì, nhân viên, Internet, truyền hình cáp
3. **Báo cáo lãi/lỗ** theo tháng
4. **Xuất báo cáo** Excel / PDF

### **K. 📊 Báo Cáo Tiêu Thụ Điện Nước:**
1. **Biểu đồ tiêu thụ** theo tháng cho từng phòng
2. **Cảnh báo tiêu thụ bất thường** (nghi ngờ rò rỉ nước, dùng điện quá mức)
3. **So sánh tiêu thụ** giữa các phòng

### **L. 🏢 Quản Lý Nhiều Cơ Sở (Multi-Property):**
1. **1 tài khoản admin** → quản lý nhiều nhà trọ/dãy trọ
2. **Dashboard tổng hợp** tất cả cơ sở cho Landlord
3. **Phân quyền Manager theo Khu vực (Branch/Area)** - Manager chỉ thấy dữ liệu của khu vực được giao.

### **M. 🌐 Trang Landing Page Cho Khách Thuê Mới:**
1. **Hiển thị phòng trống** (ảnh, giá, tiện ích)
2. **Đặt lịch xem phòng** online
3. **Form đăng ký thuê** → chủ trọ duyệt
4. **SEO** để khách tìm được trên Google

### **N. 📱 Progressive Web App (PWA):**
1. **Cài app trên điện thoại** không cần App Store / Google Play
2. **Push notification** native
3. **Offline mode** (xem hóa đơn khi mất mạng)

### **O. Tính năng bổ sung:**
- **Login:** Thêm đăng nhập bằng GMAIL (Google OAuth)
- **Auto gửi hóa đơn:** Khi hoàn thành hóa đơn sẽ gửi đến ACCOUNT của khách thuê

## 🖥️ KIẾN TRÚC GIAO DIỆN B2B2C (UI/UX ARCHITECTURE)

Hệ thống được chia thành 4 phân hệ giao diện độc lập nhằm tối ưu hóa trải nghiệm dựa trên trách nhiệm cụ thể:

### **1. Super Admin Portal (Platform Master - Chủ nền tảng)**
*   **Thẩm mỹ**: Enterprise, chuyên nghiệp, sử dụng Dark Mode hoặc tone màu Navy sang trọng.
*   **Chức năng trọng tâm**:
    *   **SaaS Dashboard**: Tổng quan sức khỏe hệ thống, số lượng Landlord, tăng trưởng doanh thu thuê bao.
    *   **Quản lý Chủ nhà (Landlord Management)**: Duyệt hồ sơ, cấp/khóa tài khoản, quản lý hạn dùng gói cước.
    *   **Giao dịch hệ thống**: Theo dõi lịch sử thanh toán phí phần mềm của các Landlord.

### **2. Landlord Portal (Business Owner - Cấp chiến lược)**
*   **Thẩm mỹ**: Data-rich, Finance-focused, sử dụng biểu đồ lớn và tone màu Emerald Green.
*   **Chức năng trọng tâm**:
    *   **Thiết lập chính sách (Pricing Policy)**: Cấu hình đơn giá điện, nước, phòng, dịch vụ cho toàn hệ thống.
    *   **Quản trị nhân sự (HR & RBAC)**: Quản lý danh sách Manager và phân quyền khu vực quản lý.
    *   **Dashboard Tài chính**: Giám sát dòng tiền, doanh thu tổng và hiệu suất của từng chi nhánh.
    *   **Quản lý Phân vùng**: Mở rộng/thu hẹp quy mô chi nhánh (Branch).

### **3. Manager Portal (Operational Staff - Cấp vận hành)**
*   **Thẩm mỹ**: Task-oriented, Mobile-friendly, sử dụng tone màu Ocean Blue và các nút bấm lớn.
*   **Chức năng trọng tâm**:
    *   **Vận hành chi tiết**: Quản lý danh sách Phòng, Khách thuê và Hợp đồng tại khu vực được gán.
    *   **Thực thi tài chính**: Nhập số liệu hàng tháng, tính toán và xuất hóa đơn theo khung giá của Landlord.
    *   **Tương tác trực tiếp**: Hỗ trợ khách thuê qua Chat real-time và xử lý yêu cầu sửa chữa.
    *   **Dashboard Vận hành**: Danh sách công việc cần xử lý ngay (thu nợ, nhập số liệu).

### **4. Tenant Portal (Minh bạch & Tiện lợi)**
*   **Thẩm mỹ**: Tối giản, thân thiện, Mobile-first (PWA), sử dụng tone màu Pastel dịu mắt.
*   **Chức năng trọng tâm**:
    *   **Personal Dashboard**: Trạng thái hóa đơn mới nhất và các thông báo quan trọng từ chủ nhà.
    *   **Thanh toán VietQR**: Quy trình 1-click để hiện mã QR thanh toán kèm nội dung tự động.
    *   **Service Request**: Gửi yêu cầu sửa chữa kèm ảnh chụp sự cố trực tiếp từ điện thoại.
    *   **Document Vault**: Xem lại hợp đồng điện tử và các quy định nhà trọ mọi lúc mọi nơi.

## 🛠️ STACK CÔNG NGHỆ ĐÃ CHỌN

### **Backend:**
- **Runtime:** Node.js + Express.js
- **Database:** MongoDB + Mongoose (đã có)
- **Authentication:** JWT + bcryptjs (đã có)
- **OAuth:** Passport.js + Google OAuth 2.0
- **Real-time:** Socket.IO + Redis (cho chat + thông báo)
- **Payment:** VNPay/Momo SDK + VietQR
- **Email:** Nodemailer
- **CRON Jobs:** node-cron / Agenda.js (tạo hóa đơn tự động, nhắc nhở, kiểm tra hợp đồng)
- **OCR:** Google Cloud Vision API / Tesseract.js
- **File Upload:** Cloudinary / AWS S3 (ảnh CCCD, hợp đồng, sửa chữa)
- **PDF Generation:** PDFKit / Puppeteer (hóa đơn, hợp đồng)
- **QR Code:** qrcode (npm) + VietQR API

### **Backend - Security:**
- **Rate Limiting:** express-rate-limit (chống brute force)
- **HTTP Headers:** helmet.js
- **NoSQL Injection:** express-mongo-sanitize
- **XSS Protection:** xss-clean
- **CORS:** cors middleware
- **Logging:** Winston + Morgan
- **Validation:** Joi / express-validator

### **Frontend:**
- **Framework:** React 18+
- **State:** Redux Toolkit hoặc Context API
- **UI:** Ant Design / Material-UI
- **Routing:** React Router DOM
- **HTTP Client:** Axios + React Query
- **Forms:** Formik + Yup
- **Real-time:** Socket.IO client
- **Charts:** Recharts / Chart.js (cho Dashboard)
- **Signature:** react-signature-canvas (ký hợp đồng điện tử)
- **PWA:** Workbox (service worker, offline cache)

### **Deployment:**
- **Frontend:** Vercel
- **Backend:** Render.com / Railway.app
- **Database:** MongoDB Atlas
- **Redis:** Redis Cloud / Upstash
- **File Storage:** Cloudinary (free tier 25GB)


## 🛡️ QUY TẮC PHÁT TRIỂN (DEVELOPMENT GUIDELINES)

Để đảm bảo chất lượng mã nguồn và tính ổn định của hệ thống, mọi thay đổi code cần tuân thủ các quy tắc sau:

### **1. Các lệnh kiểm tra bắt buộc:**
*   **Build**: `npm run build` - Chạy kiểm tra build trước khi triển khai.
*   **Test**: `npm test` - **BẮT BUỘC** phải Pass tất cả các test case trước khi commit hoặc kết thúc task.
*   **Lint**: `npm run lint` - Kiểm tra lỗi định dạng và quy tắc code.

### **2. Quy trình làm việc (Boundaries):**
*   **Luôn chạy Test**: Trước mỗi lần hoàn thành một tính năng (commit), phải chạy `npm test`.
*   **Hỏi ý kiến trước khi đổi Schema**: Bất kỳ thay đổi nào liên quan đến Database Schema (Mongoose Models) đều phải thảo luận và được sự đồng ý của User trước khi thực hiện.
*   **Thiết kế Responsive (Mobile-First)**: Luôn code song song giao diện tương thích với PC, Tablet và Mobile. Sử dụng hệ thống Grid (xs, sm, md, lg) của Ant Design để đảm bảo không bị vỡ giao diện trên mọi thiết bị.
*   **Đồng bộ NotebookLM**: Mỗi khi có thay đổi lớn về kế hoạch hoặc cấu trúc, phải tạo một nguồn mới trên NotebookLM kèm mốc thời gian.

## 🔄 LUỒNG NGHIỆP VỤ CHÍNH

### **Luồng 1: Tạo hóa đơn hàng tháng**
```
Ngày 1 hàng tháng (CRON Job)
  → Kiểm tra chỉ số điện nước đã nhập chưa
  → Tính toán: tiền phòng + điện + nước + phí khác
  → Tạo Invoice (status: pending)
  → Tạo QR Code (VietQR)
  → Gửi email/push notification cho khách thuê
  → Nhắc lại sau 3 ngày nếu chưa thanh toán
```

### **Luồng 2: Thanh toán**
```
Khách thanh toán (QR/VNPay/Momo/Tiền mặt)
  → Webhook nhận callback / Chủ trọ xác nhận thủ công
  → Cập nhật Invoice (status: paid)
  → Tạo Payment record
  → Gửi biên lai qua email
  → Cập nhật Dashboard thống kê
```

### **Luồng 3: Hết hạn hợp đồng**
```
CRON Job kiểm tra hàng ngày
  → Hợp đồng còn 30 ngày → Thông báo cho cả hai bên
  → Hợp đồng còn 7 ngày → Nhắc lại lần 2
  → Hết hạn → Chủ trọ chọn: Gia hạn / Trả phòng
  → Gia hạn: Tạo hợp đồng mới, cập nhật thời hạn
  → Trả phòng: Tính tiền cuối, hoàn cọc, cập nhật phòng → available
```

### **Luồng 4: Yêu cầu sửa chữa**
```
Khách thuê tạo yêu cầu (kèm ảnh)
  → Thông báo cho chủ trọ
  → Chủ trọ xác nhận → phân công thợ
  → Cập nhật tiến độ (in_progress)
  → Hoàn thành → ghi nhận chi phí
  → Chi phí → tính vào Expense báo cáo tài chính
```

## 📅 LỘ TRÌNH PHÁT TRIỂN

| Phase | Tính năng | Trạng thái |
|---|---|---|
| **Phase 6** | Landing page + PWA + OCR + E-Contract + Polish | 📅 SẮP TỚI |
| **Phase 5** | Yêu cầu sửa chữa (Tenant) → Quản lý bảo trì (Admin) + Báo cáo Tài chính chi tiết | 📅 SẮP TỚI |
| **Phase 4.5** | Cấu hình giá dịch vụ theo Chi nhánh (Branch-Level Pricing) + Chặn Manager sửa giá khi làm Hợp đồng | 🚀 IN PROGRESS |
| **Phase 4** | Chat real-time + Thông báo đẩy (Push/Email) + **Phân quyền Khu vực (Regional Management)** | ✅ HOÀN THÀNH |
| **Phase 3** | Thanh toán VietQR (Client-side) + Webhook xác nhận (Server-side) | ✅ HOÀN THÀNH |
| **Phase 2.5**| **Kiến trúc Multi-Tenancy & Super Admin** (Tách dữ liệu theo Landlord, Portal cho Super Admin quản lý Chủ nhà) | ✅ HOÀN THÀNH |
| **Phase 2** | Nhập điện nước (OCR) + Hóa đơn + Dashboard Biểu đồ + Cấu hình giá hệ thống + Quản lý phí dịch vụ (Wifi, Rác) + Chi phí phát sinh | ✅ HOÀN THÀNH |
| **Phase 1** | Auth (RBAC) + Admin/Tenant Layout + CRUD Phòng/Tenant/Hợp đồng + **Mobile-First UX** | ✅ HOÀN THÀNH |

**Tổng ước tính: 7-9 tuần cho MVP đầy đủ (Bao gồm Multi-Tenancy)**

---

## 🗂️ MASTER TASK BOARD

> Cập nhật lần cuối: 2026-05-06 | Nguồn gốc: Notion `Plans QuanLyNhaTro` + NotebookLM

### 📅 Phase 6 — Advanced Features & Polish

| Tên Task | Phase | Loại | Ưu tiên | Trạng thái |
|----------|-------|------|---------|------------|
| Landing Page SEO (hiển thị phòng trống, đặt lịch xem) | P6 | FE | P1 | To-do |
| PWA setup — Workbox, offline mode, manifest | P6 | FE | P1 | To-do |
| OCR chụp ảnh đồng hồ điện nước (Tesseract.js) | P6 | BE+FE | P2 | To-do |
| Hợp đồng điện tử (ký tay + xuất PDF có mã xác thực) | P6 | BE+FE | P2 | To-do |
| Google OAuth login (Passport.js) | P6 | BE+FE | P2 | To-do |
| Cảnh báo tiêu thụ điện nước bất thường | P6 | BE+FE | P2 | To-do |

### 📅 Phase 5 — Maintenance & Financial Reports

| Tên Task | Phase | Loại | Ưu tiên | Trạng thái |
|----------|-------|------|---------|------------|
| Tenant tạo yêu cầu sửa chữa (kèm ảnh mô tả) | P5 | BE+FE | P0 | To-do |
| Admin xác nhận, phân công + theo dõi tiến độ | P5 | BE+FE | P0 | To-do |
| Lịch sử bảo trì theo từng phòng | P5 | FE | P1 | To-do |
| Ghi nhận chi phí sửa chữa vào Expense | P5 | BE | P0 | To-do |
| Báo cáo lãi/lỗ theo tháng | P5 | BE+FE | P0 | To-do |
| Xuất báo cáo PDF/Excel (PDFKit/Puppeteer) | P5 | BE | P1 | To-do |

### 🚀 Phase 4.5 — Branch-Level Utility Pricing & Contract Strict Roles (Current)

> **📍 ĐIỂM DỪNG (06/05/2026): Ngày mai chúng ta sẽ bắt đầu từ đây (Cập nhật Schema cho Branch).**

| Tên Task | Phase | Loại | Ưu tiên | Trạng thái |
|----------|-------|------|---------|------------|
| Cập nhật Mongoose Schema: Thêm `electricityPrice`, `waterPrice`, `internetPrice`, `garbagePrice` vào `Branch.js` | P4.5 | BE | P0 | To-do |
| Migrate dữ liệu: Xóa cài đặt giá khỏi `Settings` và chuyển sang `Branch` | P4.5 | BE | P0 | To-do |
| Giao diện Landlord: Thêm form cài đặt giá dịch vụ trong lúc tạo/sửa Chi nhánh | P4.5 | FE | P0 | To-do |
| Giao diện Manager: Khóa (disable) các ô giá dịch vụ khi tạo Hợp đồng mới, tự động fetch từ Branch | P4.5 | FE | P0 | To-do |
| Backend Contract: Ràng buộc lưu giá Hợp đồng phải được fetch trực tiếp từ Branch db, chống bypass từ Manager | P4.5 | BE | P0 | To-do |
| UI/UX: Ẩn nút tạo/sửa phòng đối với Landlord, điều hướng luồng công việc này cho Manager | P4.5 | FE | P1 | To-do |

### ✅ Phase 4 — Real-time Chat & Notifications

| Tên Task | Phase | Loại | Ưu tiên | Trạng thái |
|----------|-------|------|---------|------------|
| [Architecture] Multi-level Regional Management (Branch/Area) | P4 | BE+FE | P0 | Done |
| [UI/UX] Task-oriented Dashboard cho Manager | P4 | FE | P1 | Done |
| [UI/UX] Tinh gọn Sidebar cho 3 vai trò (Refinement) | P4 | FE | P1 | Done |
| Socket.IO setup (server + client integration) | P4 | BE+FE | P0 | Done |
| Chat room theo từng phòng trọ | P4 | BE+FE | P0 | Done |
| Typing indicator + Online status | P4 | FE | P1 | Done |
| [UI/UX] Custom Dashboard cho Super Admin (SaaS Metrics) | P4 | FE | P1 | Done |
| [UI/UX] Custom Dashboard cho Landlord (Finance Focus) | P4 | FE | P1 | Done |
| [UI/UX] Refine Tenant Mobile-first experience | P4 | FE | P1 | Done |
| Gửi file/ảnh trong chat (Cloudinary upload) | P4 | BE+FE | P1 | To-do |
| CRON Job nhắc đóng tiền trước 3-5 ngày (node-cron) | P4 | BE | P0 | To-do |
| Push notification khi có hóa đơn mới / nhắc nợ | P4 | BE+FE | P1 | To-do |

### ✅ Phase 3 — VietQR Payment & Webhook Automation

| Tên Task | Phase | Loại | Ưu tiên | Trạng thái |
|----------|-------|------|---------|------------|
| Tạo model `Payment.js` | P3 | BE | P0 | Done |
| Cập nhật `SystemSetting.js` — thêm bankId, accountNo, webhookSecret | P3 | BE | P0 | Done |
| Cải thiện VietQR — nhúng `invoiceNumber` vào nội dung QR | P3 | BE | P0 | Done |
| Tạo `paymentController.js` — Webhook handler + auto-matching | P3 | BE | P0 | Done |
| Tạo `paymentRoutes.js` & mount vào `server.js` | P3 | BE | P0 | Done |
| Tạo `middleware/webhookAuth.js` — HMAC-SHA256 validation | P3 | BE | P0 | Done |
| UI QR thanh toán lớn + hướng dẫn cho Tenant Portal | P3 | FE | P0 | Done |
| Nút xác nhận thanh toán thủ công cho Admin | P3 | FE | P1 | Done |
| Email biên lai sau khi thanh toán (Nodemailer) | P3 | BE | P1 | To-do (Backlog) |
| Cập nhật Dashboard sau khi thanh toán thành công | P3 | FE | P1 | Done |

### ✅ Phase 2.5 — Multi-Tenancy & Super Admin

| Tên Task | Phase | Loại | Ưu tiên | Trạng thái |
|----------|-------|------|---------|------------|
| Tách dữ liệu theo `landlordId` (Multi-Tenant) | P2.5 | BE | P0 | Done |
| Super Admin Portal (quản lý Landlords) | P2.5 | FE | P0 | Done |
| Super Admin Portal (Management) | P2.5 | FE | P1 | Done |
| Migration script (dữ liệu cũ → landlordId) | P2.5 | BE | P0 | Done |

### ✅ Phase 2 — Billing & Tenant Portal

| Tên Task | Phase | Loại | Ưu tiên | Trạng thái |
|----------|-------|------|---------|------------|
| Nhập chỉ số điện nước hàng tháng | P2 | BE+FE | P0 | Done |
| Tự động tính tiền + tạo hóa đơn | P2 | BE | P0 | Done |
| Dashboard biểu đồ doanh thu (Recharts) | P2 | FE | P0 | Done |
| Cấu hình giá điện/nước/dịch vụ (SystemSetting) | P2 | BE+FE | P0 | Done |
| Tenant Bill Portal (xem hóa đơn cá nhân) | P2 | FE | P0 | Done |
| VietQR cơ bản (generate URL ảnh QR) | P2 | BE | P1 | Done |

### ✅ Phase 1 — Auth & Core UI

| Tên Task | Phase | Loại | Ưu tiên | Trạng thái |
|----------|-------|------|---------|------------|
| JWT Auth + bcrypt login/register | P1 | BE | P0 | Done |
| RBAC Middleware (SUPER_ADMIN/LANDLORD/MANAGER/TENANT) | P1 | BE | P0 | Done |
| Multi-Portal Layout (Admin / Tenant riêng biệt) | P1 | FE | P0 | Done |
| CRUD Phòng (Room management) | P1 | BE+FE | P0 | Done |
| CRUD Người thuê (Tenant management) | P1 | BE+FE | P0 | Done |
| CRUD Hợp đồng (Contract management) | P1 | BE+FE | P0 | Done |
| Mobile-First Responsive UI (Ant Design Grid) | P1 | FE | P0 | Done |

---

### 📊 Thống kê tổng quan

| Chỉ số | Số lượng |
|--------|---------|
| **Tổng tasks** | 45 |
| ✅ Done | 32 (P1, P2, P2.5, P3, P4 Core) |
| 🚀 In Progress | 1 (P4 Notifications) |
| 📅 To-do | 19 (P3 Backlog + P4 -> P6) |
| 🔴 P0 tasks còn lại | 7 |
| 🟡 P1 tasks còn lại | 8 |
| 🟢 P2 tasks còn lại | 6 |