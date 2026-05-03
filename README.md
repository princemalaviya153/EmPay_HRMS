# EmPay HRMS 🚀

EmPay HRMS is a comprehensive, enterprise-grade Human Resource Management System inspired by Odoo. It is designed to handle large-scale employee data, automated payroll processing, and complex HR workflows with a premium, modern interface.

![Dashboard Preview](https://via.placeholder.com/1200x600.png?text=EmPay+HRMS+Dashboard+Preview)

## 🌟 Key Features

### 👥 Core HR Management
- **Centralized Employee Directory**: Manage 2,000+ employee records with ease.
- **Detailed Profiles**: Capture private info, work experience, education, and banking details.
- **Hierarchical Structure**: Manage reporting lines and department-wise distributions.

### 💰 Automated Payroll Engine
- **Dynamic Salary Structures**: Configure base salary and percentage-based allowances (HRA, Special Allowance, etc.).
- **Bulk Processing**: Optimized backend capable of generating monthly payruns for thousands of employees in seconds.
- **Detailed Payslips**: Professional breakdown of earnings (HRA, Bonus, LTA) and deductions (PF, Professional Tax).
- **Compliance Ready**: Integrated calculations for PF (Employer & Employee) and state-specific taxes.

### 📅 Attendance & Leave
- **Intelligent Logs**: Track check-ins, check-outs, and total working hours.
- **Geofencing Ready**: Infrastructure for location-based login verification.
- **Leave Workflow**: Automated leave allocations (Earned, Sick, Casual) and multi-level approval systems.

### 📊 Advanced Reporting
- **Interactive Dashboards**: Real-time analytics for headcount trends and labor costs.
- **Performance Optimized**: Frontend pagination and optimized backend queries for high-volume data.
- **Export Ready**: View monthly statements and salary reports.

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS, Recharts (for analytics).
- **Backend**: Node.js, Express.js.
- **ORM**: Sequelize.
- **Database**: PostgreSQL.
- **Authentication**: JWT-based secure login.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- PostgreSQL

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/princemalaviya153/EmPay_HRMS.git
   cd EmPay_HRMS
   ```

2. **Install Dependencies**
   ```bash
   # Install Backend dependencies
   cd server
   npm install

   # Install Frontend dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   DB_NAME=empay_db
   DB_USER=postgres
   DB_PASS=your_password
   DB_HOST=localhost
   JWT_SECRET=your_secret_key
   ```

4. **Seed Database**
   ```bash
   cd server
   # For standard demo data
   node seedData.js
   # For large-scale stress testing (2000 records)
   node seedBigData.js
   ```

5. **Run the Application**
   ```bash
   # Start Server
   cd server
   npm run dev

   # Start Client
   cd client
   npm start
   ```

## 🔒 Security & Performance
- **Optimized SQL**: Bulk operations implemented for payroll generation to minimize database round-trips.
- **UI Scalability**: Virtualization and pagination techniques used for handling large lists.
- **Geofencing Infrastructure**: Modular design allows for easy integration of location-based login rules.

## 📄 License
This project is licensed under the MIT License.

---
Developed with ❤️ by Prince Malaviya
