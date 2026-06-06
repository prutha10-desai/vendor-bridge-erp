# 🏢 VendorBridge ERP

A comprehensive procurement and vendor management system built with modern web technologies. VendorBridge streamlines the entire procurement workflow from RFQ creation to purchase orders, invoices, and analytics—all with role-based access control and enterprise-grade security.

---

## ✨ Features

### Core Capabilities
- **Vendor Management** - Register, manage, and track vendor profiles with detailed information
- **RFQ (Request for Quotation)** - Create, send, and compare quotations from multiple vendors
- **Purchase Orders** - Generate and manage purchase orders with approval workflows
- **Invoicing** - Create, track, and manage vendor invoices
- **Procurement Analytics** - Visualize spending trends, vendor performance, and procurement metrics
- **Audit Logging** - Track all system actions for compliance and accountability
- **Email Notifications** - Automated email alerts for RFQs, POs, and approvals
- **PDF Generation** - Export quotations and purchase orders as PDF documents

### Security & Access Control
- **Role-Based Access Control (RBAC)** - Four distinct roles: Admin, Procurement Officer, Vendor, Manager
- **JWT Authentication** - Secure token-based authentication
- **Email & OTP Verification** - Two-factor authentication with OTP support
- **Google OAuth Integration** - SSO capability with Google accounts
- **Protected Routes** - Frontend guards and backend middleware for secure access

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first CSS framework
- **React Router v7** - Client-side routing
- **Zustand** - State management
- **Axios** - HTTP client
- **Framer Motion** - Animations
- **Zod** - TypeScript-first schema validation
- **Lucide React** - Icon library

### Backend
- **Node.js + Express** - Server framework
- **MongoDB + Mongoose** - NoSQL database and ODM
- **JWT** - JSON Web Tokens for authentication
- **Nodemailer** - Email service
- **PDFKit** - PDF generation
- **Google Auth Library** - OAuth integration
- **Multer** - File upload handling
- **Bcryptjs** - Password hashing

### Development Tools
- **Nodemon** - Auto-restart server on changes
- **ESLint** - Code linting
- **Dotenv** - Environment variable management

---

## 📋 Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **MongoDB** (local or Atlas cloud)
- **Git** for version control
- Google OAuth credentials (for OAuth features)

---

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/prutha10-desai/vendor-bridge-erp.git
cd vendor-bridge-erp
```

### 2. Backend Setup

Navigate to the backend directory:
```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Create a `.env` file in the backend directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/vendorbridge
# OR use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/vendorbridge

# JWT Secret (generate a strong random string)
JWT_SECRET=your_very_secure_jwt_secret_key_here

# Email Service (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OTP Settings
OTP_EXPIRY=300

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

Seed the database with initial data:
```bash
npm run dev
# After server starts, access /api/auth/seed-admin to create admin user
```

### 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

---

## 🎯 Running the Application

### Start Backend Server
```bash
cd backend
npm run dev
```
The backend will run on `http://localhost:5000`

### Start Frontend Development Server
In a new terminal:
```bash
cd frontend
npm run dev
```
The frontend will run on `http://localhost:5173`

### Build for Production
**Frontend:**
```bash
cd frontend
npm run build
npm run preview  # Preview production build
```

**Backend:**
```bash
cd backend
npm start
```

---

## 📁 Project Structure

```
vendor-bridge-erp/
├── backend/
│   ├── config/
│   │   ├── db.js                 # Database connection
│   │   └── seedAdmin.js          # Admin seeding script
│   ├── controllers/              # Route handlers
│   │   ├── authController.js
│   │   ├── vendorController.js
│   │   ├── rfqController.js
│   │   ├── quotationController.js
│   │   ├── documentController.js
│   │   └── analyticsController.js
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verification
│   ├── models/                   # Mongoose schemas
│   │   ├── User.js
│   │   ├── Vendor.js
│   │   ├── RFQ.js
│   │   ├── Quotation.js
│   │   ├── PurchaseOrder.js
│   │   ├── Invoice.js
│   │   ├── AuditLog.js
│   │   └── Otp.js
│   ├── routes/                   # API route definitions
│   ├── utils/                    # Helper functions
│   │   ├── emailService.js
│   │   ├── otpService.js
│   │   ├── pdfService.js
│   │   ├── generators.js
│   │   ├── googleAuth.js
│   │   └── auditHelper.js
│   ├── uploads/                  # File upload storage
│   ├── server.js                 # Express app entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/                  # API client functions
│   │   │   ├── auth.js
│   │   │   ├── client.js
│   │   │   ├── dashboard.js
│   │   │   ├── users.js
│   │   │   └── vendors.js
│   │   ├── components/
│   │   │   ├── auth/             # Authentication components
│   │   │   ├── layout/           # App layout components
│   │   │   └── ui/               # Reusable UI components
│   │   ├── pages/                # Page components
│   │   ├── store/                # Zustand stores
│   │   │   └── authStore.js
│   │   ├── utils/                # Utility functions
│   │   ├── App.jsx               # Root component
│   │   └── main.jsx              # Entry point
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

---

## 🔐 User Roles & Permissions

### 1. **Admin**
   - Manage users and roles
   - View system audit logs
   - Access all analytics
   - System configuration

### 2. **Procurement Officer**
   - Create and manage RFQs
   - Compare quotations
   - Generate purchase orders
   - Manage invoices
   - View procurement analytics

### 3. **Vendor**
   - View RFQs sent to them
   - Submit quotations
   - View purchase orders
   - Manage invoices

### 4. **Manager**
   - Approve purchase orders
   - View vendor performance
   - Access analytics and reports
   - Approve invoices

---

## 📡 API Endpoints Overview

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login with credentials
- `POST /google-auth` - Google OAuth login
- `POST /request-otp` - Request OTP for email verification
- `POST /verify-otp` - Verify OTP
- `GET /seed-admin` - Seed initial admin user
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token

### Vendors (`/api/vendors`)
- `GET` - List all vendors
- `POST` - Create vendor
- `GET /:id` - Get vendor details
- `PUT /:id` - Update vendor
- `DELETE /:id` - Delete vendor

### RFQ (`/api/rfq`)
- `GET` - List RFQs
- `POST` - Create RFQ
- `GET /:id` - Get RFQ details
- `PUT /:id` - Update RFQ status

### Quotations (`/api/quotations`)
- `GET` - List quotations
- `POST` - Submit quotation
- `GET /:id` - Get quotation details
- `PUT /:id` - Update quotation

### Documents (`/api/documents`)
- `POST /purchase-order` - Generate purchase order
- `POST /quotation` - Generate quotation PDF
- `GET /:id` - Download document

### Analytics (`/api/analytics`)
- `GET /dashboard` - Dashboard metrics
- `GET /spending-trends` - Spending analysis
- `GET /vendor-performance` - Vendor metrics

### Users (`/api/users`)
- `GET` - List users
- `PUT /:id` - Update user
- `DELETE /:id` - Delete user

---

## 🗄️ Database Schema

### Key Collections:
- **Users** - System users with roles
- **Vendors** - Vendor information and contact details
- **RFQs** - Requests for quotation
- **Quotations** - Vendor responses to RFQs
- **PurchaseOrders** - Purchase order documents
- **Invoices** - Billing documents
- **AuditLogs** - System action logs
- **OTPs** - One-time passwords for verification

---

## 🔧 Configuration

### Environment Variables Reference

**Backend:**
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT signing
- `EMAIL_USER` - Sender email address
- `EMAIL_PASS` - Email service password/token
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

**Frontend:**
- `VITE_API_URL` - Backend API base URL
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth client ID

---

## 📝 Usage Examples

### Creating an RFQ
1. Login as Procurement Officer
2. Navigate to RFQ creation page
3. Select vendors and add items
4. Set deadline and submit
5. Vendors receive email notifications

### Approving a Purchase Order
1. Login as Manager
2. View pending approvals
3. Review PO details
4. Approve/Reject with comments
5. Admin notified of action

### Viewing Analytics
1. Login as any user with analytics access
2. Dashboard shows key metrics
3. View spending trends and vendor performance
4. Export reports if available

---

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running (`mongod` for local)
- Verify `MONGODB_URI` in `.env`
- For MongoDB Atlas, whitelist your IP address

### Email Not Sending
- Enable "Less secure app access" for Gmail
- Use app-specific password for Gmail
- Check `EMAIL_USER` and `EMAIL_PASS` in `.env`

### CORS Errors
- Verify `FRONTEND_URL` matches frontend origin
- Ensure `FRONTEND_URL` is in backend `.env`

### Port Already in Use
- Backend: Change `PORT` in `.env`
- Frontend: Use `npm run dev -- --port 3000`

### JWT Token Issues
- Clear browser cookies and localStorage
- Generate new `JWT_SECRET` if needed
- Ensure token hasn't expired

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m 'Add your feature'`
3. Push branch: `git push origin feature/your-feature`
4. Open a Pull Request

---

## 📄 License

This project is open source and available under the MIT License.

---

## 📞 Support

For issues, questions, or suggestions:
- Open an GitHub issue
- Check existing documentation
- Review API endpoint examples

---

## 🎓 Demo Notes

This application is designed for enterprise-style demonstrations with:
- Seeded sample data for quick demos
- Mock API responses for unavailable features
- Pre-configured user accounts and vendors
- Sample RFQs and quotations ready for testing
---
