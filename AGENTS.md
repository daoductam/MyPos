# AGENTS.md

## Project Overview
**DMart POS** là một hệ sinh thái quản lý bán hàng (SaaS POS) toàn diện, được thiết kế để vận hành mô hình bán lẻ đa chi nhánh với khả năng mở rộng cao. Dự án tập trung vào tính ổn định, bảo mật và trải nghiệm người dùng mượt mà trên nền tảng Web hiện đại.

## Tech Stack
### Backend (Enterprise Java)
- **Core**: Java 21, Spring Boot 3.5+
- **Persistence**: Spring Data JPA, MySQL 8.0
- **Security**: Spring Security (Stateless JWT), Role-based Access Control (RBAC)
- **Payments**: Tích hợp cổng thanh toán Stripe & Razorpay
- **Mailing**: Java Mail Sender cho hóa đơn và thông báo
- **Automation**: JIB for Containerization (Docker-less builds)
- **Convention**: MapStruct/Mappers (Data Layer Isolation)

### Frontend (Modern React)
- **Framework**: React 19 (Vite), TypeScript/JavaScript
- **Styling**: Tailwind CSS 4, Radix UI (Shadcn/UI components)
- **State Management**: Redux Toolkit (Slices, Async Thunks)
- **Routing**: React Router 7 (Data APIs, Layouts)
- **Validation**: Zod & React Hook Form
- **Aesthetics**: Framer Motion (Micro-animations), Lucide Icons
- **Features**: i18next (Internationalization), Recharts (Analytics), react-to-print (Receipt Generation)

## Project Structure
- `Backend/`: Source code Spring Boot REST API.
- `Frontend/`: Source code React SPA (Single Page Application).
- `.agent/`: Bộ não của AI (Workflows, Rules, và Skills tùy chỉnh).

## Operational Resources (AI Context)
Mọi hành động của AI phải tuân thủ nghiêm ngặt các tài nguyên sau:
- **Workflows**: Tham khảo `.agent/workflows/` (`feature.md`, `debug.md`, `improve.md`).
- **Coding Rules**: Tuân thủ `code-quality.md` (SOLID, DRY) và `security.md` (Security First).
- **Special Skills**: Sử dụng các skills chuyên dụng như `api-design`, `database-design`, `code-reviewer` khi thực hiện nhiệm vụ.

## Conventions & Best Practices
- **Clean Code**: Ưu tiên Readable Code hơn Clever Code. Tuân thủ nguyên tắc Single Responsibility.
- **API Naming**: Tuân thủ RESTful API standards, sử dụng snake_case hoặc camelCase nhất quán theo codebase.
- **DTO Pattern**: Luôn sử dụng Payload/DTO để truyền dữ liệu giữa Controller và Service, tránh leak Entity ra ngoài API.
- **Atomic Components**: Frontend chia nhỏ components theo tính tái sử dụng cao, áp dụng pattern của Shadcn/UI.
- **Error Handling**: Sử dụng Global Exception Handler (Backend) và Toast Notifications (Frontend).
- **Git**: Tuân thủ Conventional Commits (feat, fix, docs, style, refactor, chore).

## Commands
### Backend (`Backend/`)
- `./mvnw spring-boot:run` — Khởi chạy ứng dụng development
- `./mvnw clean install` — Build và cài đặt dependencies
- `./mvnw test` — Chạy bộ kiểm thử tự động

### Frontend (`Frontend/`)
- `npm run dev` — Khởi chạy môi trường phát triển (Vite)
- `npm run build` — Build production bundle
- `npm install` — Cài đặt các gói phụ thuộc