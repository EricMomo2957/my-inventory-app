📦 Inventory Pro — Smart Stock Management System

        Inventory Pro is a robust, web-based inventory management system designed to eliminate the chaos of manual stock counting and streamline business operations. The project provides enterprise-grade tools to manage stock levels, track sales via a smart checkout system, and generate real-time activity reports for audit trails.

🚦 Status

        Repository state: Active / Full-Stack Integration.

        Frontend: React (Vite) with custom Glassmorphism UI and dynamic dark mode is fully functional.

        Backend: Express API server integrated with MySQL; handles real-time transactions and file uploads.

        Database: Structured MySQL schema with products, faqs, and activity_history.

📋 Table of Contents

        About

        Key Features

        Architecture & Repository Structure

        Requirements

        Installation (Developer)

        Configuration (.env example)

        Database Schema

Important Notes / Security

Contact

📖 About
    Inventory Pro provides:

        Real-time Stock Tracking: Instant synchronization of stock levels across multiple team members.
        Smart Checkout: A secure transaction system that ensures database integrity during sales.
        Activity Logging: Automated recording of every restock and sale for comprehensive auditing.
        Asset Management: Integrated image handling for products using Multer.

✨ Key Features
        ⚡ Real-time Tracking: Monitor stock changes as they happen.

        🛒 Smart Checkout: Prevents stock errors with database transaction support.

        🌙 Adaptive UI: High-end "Glassmorphism" design with automatic light/dark mode detection.

        🛡️ Secure Access: Role-based staff permissions and authenticated profile management.

        🏗️ Architecture & Repository Structure
        The project follows a decoupled client-server architecture:


        MY-INVENTORY-APP/
        ├── backend/                  # Express.js API Server
        │   ├── config/              # Database connection (db.js)
        │   ├── routes/              # RESTful API endpoints (products, checkout, faqs)
        │   ├── uploads/             # Physical storage for product images
        │   ├── app.js               # Entry point and server middleware
        │   └── .env                 # Sensitive credentials (git-ignored)
        ├── frontend/                 # React.js SPA (Vite)
        │   ├── src/                 
        │   │   ├── components/      # Reusable UI (Navbar, Magnetic Buttons)
        │   │   ├── pages/           # View logic (Order, LandingPage, Login)
        │   │   └── App.jsx          # Root routing and state logic
        │   └── vite.config.js       # Vite build configuration
        └── READ.md                   # Project documentation


⚙️ Requirements
        Node.js: v16.0+ recommended

        Database: MySQL 8.0 or MariaDB

        Environment: npm or yarn

        Tools: phpMyAdmin (for easy DB management).

🚀 Installation (Developer)
1. Clone the repository:
   
    git clone https://github.com/EricMomo2957/my-inventory-app.git
    cd my-inventory-app

2. Install PHP/Node dependencies: (Run in both /frontend and /backend folders)

    npm install
    
3.  Setup Database:

    Create a database named inventory_management_db in phpMyAdmin.

    Import the provided SQL schema for products and faqs tables.

📄 Configuration (.env example)
    
    Create a .env file in the /backend root with the following variables:

🔒 Important Notes / Security
    
    Input Validation: All server-side inputs are sanitized to prevent SQL Injection.

Transaction Integrity: The /api/checkout route uses database transactions to ensure data consistency during high-traffic sales.

Environment Safety: Never commit your .env file; it is listed in .gitignore to protect your database credentials.

👤 Contact
    
    Lead Developer: Eric Momo — GitHub Profile

    Email: Momoe2957@gmail.com

    Project Link: https://github.com/EricMomo2957/my-inventory-app