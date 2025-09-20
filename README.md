A full-stack web application to help users securely store their important documents and get timely reminders before they expire.
Built with Node.js, Express, MongoDB, and React, this project is designed to be simple, secure, and scalable.

✨ Features

🔑 User Authentication – Register, login, and manage your account with secure JWT authentication.

🗂 Document Management – Add, edit, and delete documents with title, type, and expiry date (or mark them as “infinity” if they don’t expire).

📎 File Uploads – Optionally upload PDF or image files with each document.

⏰ Smart Reminders – Receive email + in-app notifications before your documents expire.

📊 Dashboard & Calendar – See expiring, expired, and permanent documents at a glance.

🔐 Security First – Encrypted data storage, token-based access, and HTTPS-ready design.

🏗 Tech Stack

Frontend: React, TailwindCSS
Backend: Node.js, Express
Database: MongoDB (Mongoose ODM)
Auth: JWT + bcrypt
Other: Multer (file uploads), Node-Cron (scheduled reminders), Nodemailer (emails)
