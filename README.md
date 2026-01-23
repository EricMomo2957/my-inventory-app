📦 Inventory Pro | Smart Stock Management System
A web-based inventory management system developed to eliminate the chaos of manual stock counting and streamline business operations. This project provides enterprise-grade tools to manage stock levels, track sales, and generate real-time activity reports.

📌 Overview
Inventory Pro allows businesses to monitor stock levels across teams instantly. It features a modern "Glassmorphism" landing page with dynamic dark mode, a secure staff dashboard, and a robust backend designed to handle real-time transactions and automated activity logging.

🔧 Features
Real-time Stock Tracking: Sync stock levels and monitor changes across teams instantly.

Smart Checkout System: Secure /api/checkout route with database transaction support to prevent stock errors.

Activity History & Logs: Automatically records restock actions and sales history for audit trails.

Product Image Management: Integrated image upload functionality using Multer.

Adaptive UI: High-end landing page with automatic dark mode detection and interactive "Magnetic" buttons.

Secure Access: User authentication and profile management for staff and admins.

🛠️ Tech Stack
Frontend: HTML5, CSS3 (Glassmorphism), JavaScript (ES6+)

Backend: Node.js, Express.js

Database: MySQL

Tools: Multer (File Uploads), Dotenv (Environment Security)

👨‍💻 Project Development
Eric Momo – Full-Stack Development, Database Architecture, and System Logic

📂 How to Run the Project
Clone the repository:

Bash
git clone https://github.com/EricMomo2957/my-inventory-app.git
cd my-inventory-app
Install Dependencies:

Bash
npm install
Configure Environment Variables: Create a .env file in the root directory and add your MySQL credentials:

Code snippet
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=inventory_db
PORT=3000

Setup the Database: Import your SQL schema into your MySQL server to create the products, transactions, and activity_history tables.

Start the Server:

Bash
node app.js
Access the System: Open your browser and go to http://localhost:3000.
