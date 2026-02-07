📦 Inventory Pro — Smart Stock Management System
    
    Inventory Pro is a robust web-based inventory management system developed to eliminate the chaos of manual stock counting and streamline business operations. The project provides enterprise-grade tools to manage stock levels, track sales via a smart checkout system, and generate real-time activity reports for audit trails.

# 🚦 Status
 
    *Repository state: Active / Fully Integrated.
    *Frontend: Modern "Glassmorphism" landing page with dynamic dark mode is fully functional.
    *Backend: Robust Express.js backend handling real-time transactions and automated activity logging.
    *Database: Structured MySQL schema with products, faqs, and activity_history.

# 📖 About
* **Inventory Pro provides:**

    *Real-time Visibility: Monitor stock levels across teams instantly.
    *Transaction Integrity: A secure checkout system designed to prevent stock counting errors.
    *Audit Readiness: Comprehensive activity logs for restocks and sales history.
    *Modern UX: A high-end adaptive UI featuring "Magnetic" buttons and automatic dark mode detection.

* **✨ Key Features**
    
    *Real-time Stock Tracking: Sync stock levels and monitor changes across teams instantly.
    *Smart Checkout System: Secure /api/checkout route with database transaction support to prevent race conditions.
    *Activity History & Logs: Automatically records every restock action and sales history for transparent audit trails.
    *Product Image Management: Integrated image upload functionality using Multer for consistent product visualization.
    *Adaptive UI: High-end landing page with automatic dark mode detection and interactive "Magnetic" hover effects.
    *Secure Access: User authentication and profile management for staff and administrators.

# 🏗️ Architecture & Structure
    
The project follows a decoupled client-server architecture:

    MY-INVENTORY-APP/
    ├── backend/                  # Express.js API Server
    │   ├── config/              # Database connection (db.js)
    │   ├── public/              # Static assets and placeholders
    │   ├── routes/              # API Endpoints (products.js, checkout.js, faqs.js)
    │   ├── uploads/             # Physical storage for product images
    │   ├── .env                 # Sensitive credentials (git-ignored)
    │   └── app.js               # Entry point and server middleware
    ├── frontend/                 # React.js SPA (Vite)
    │   ├── src/                 
    │   │   ├── components/      # Reusable UI (Navbar, Sidebar, Magnetic Buttons)
    │   │   ├── pages/           # View logic (LandingPage, Order, Login)
    │   │   └── App.jsx          # Root routing and state logic
    │   └── vite.config.js       # Vite build configuration
    └── READ.md                   # Project documentation

# 🛠️ Tech Stack

    - [x]Frontend: HTML5, CSS3 (Tailwind/Glassmorphism), JavaScript (ES6+), React.js (Vite)
    - [x]Backend: Node.js, Express.js
    - [x]Database: MySQL
    - [x]Tools: Multer (File Uploads), Dotenv (Environment Security), Axios
    
# ⚙️ Requirements
    - [x]Node.js: v16.0 or higher
    - [x]Database: MySQL 8.0 or MariaDB
    - [x]Package Manager: npm (v8.0+)
    - [x]Tools: phpMyAdmin (recommended for DB setup)

# 🚀 Installation (Developer)**

    1.Clone the repository:

        git clone https://github.com/EricMomo2957/my-inventory-app.git 

        cd my-inventory-app

    2.Install Dependencies: In both /frontend and /backend folders, run:

        npm install

    3.Setup the Database:

        Create a database named inventory_management_db in your local MySQL server.

        Import the SQL schema provided to create the products, transactions, faqs, and activity_history tables.

# 📄 Configuration (.env example)**

    Create a .env file in the /backend directory with the following content:

    APP_ENV=development
    PORT=3000

    # Database
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_password
    DB_NAME=inventory_management_db

    # File Uploads
    UPLOADS_PATH=uploads
    MAX_UPLOAD_SIZE=5242880 # 5MB limit in bytes

# 🔒 Important Notes / Security**

    - Transaction Integrity: The /api/checkout route utilizes database transactions. This ensures that if a stock update fails, the entire transaction is rolled back, preventing "ghost" orders.

    - Input Sanitization: All server-side inputs are validated to protect against SQL Injection.

    - Environment Safety: Database credentials and API keys are stored in .env and are excluded from version control via .gitignore.

    - File Security: Multer is configured to restrict file types to standard image formats to prevent malicious uploads.

# 👨‍💻 Project Development**
    
    - Eric Momo — Lead Developer: Full-Stack Development, Database Architecture, and System Logic.

# 👤 Contact**

    - GitHub Profile: EricMomo2957
    - Email: Momoe2957@gmail.com
    - Project Link: https://github.com/EricMomo2957/my-inventory-app