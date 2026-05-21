# 👗 FashionLend

FashionLend is a full-stack MERN (MongoDB, Express, React, Node.js) web application for renting and lending fashion items online. Users can browse fashion products, list their own items, and manage rentals in a simple and modern interface.

---

## 🚀 Features

- 🛍️ Browse fashion items (clothes, accessories, etc.)
- 📤 Add your own items for rent/lend
- 👤 User authentication (login/signup)
- ❤️ Save favorite items
- 📦 Manage listings
- 🔍 Search and filter products
- 📱 Responsive UI (mobile + desktop)

---

## 🛠️ Tech Stack

### Frontend:
- React.js
- HTML, CSS, JavaScript
- Axios

### Backend:
- Node.js
- Express.js

### Database:
- MongoDB (Mongoose)

### Other Tools:
- JWT Authentication
- bcrypt.js (password hashing)
- dotenv
- CORS

---

## 📁 Project Structure
Fashionlend/
│
├── client/ # React frontend
│ ├── src/
│ └── package.json
│
├── server/ # Express backend
│ ├── routes/
│ ├── models/
│ ├── controllers/
│ └── server.js
│
└── README.md
2. Setup backend
cd server
npm install

Create .env file:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000

Run backend:

npm start
3. Setup frontend
cd client
npm install
npm start
🌐 Environment Variables

Create a .env file in /server:

MONGO_URI=
JWT_SECRET=
PORT=5000
📸 Screenshots

(Add screenshots here after deployment)

🚀 Future Improvements
Payment gateway integration 💳
Admin dashboard 📊
Real-time chat between users 💬
Advanced recommendation system 🤖
Deployment on Vercel & Render 🌍
👨‍💻 Author

Paras Thakur
GitHub: Paras-Thakur
