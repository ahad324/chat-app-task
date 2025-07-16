
[![Server CI](https://github.com/ahad324/chat-app-task/actions/workflows/server-ci.yml/badge.svg)](https://github.com/ahad324/chat-app-task/actions/workflows/server-ci.yml)
[![Client CI](https://github.com/ahad324/chat-app-task/actions/workflows/client-ci.yml/badge.svg)](https://github.com/ahad324/chat-app-task/actions/workflows/client-ci.yml)

# Real-time Chat Application (Task 5)

## Project Overview

This is a real-time chat application built as part of Task 5 for implementing real-time features using Socket.io. The application allows users to register, log in, search for other users, initiate chats, send messages, edit messages, delete messages (soft delete), and receive real-time updates. It features typing indicators, notifications for new messages in non-selected chats, and profile picture uploads using Cloudinary. The backend is powered by Node.js, Express, and MongoDB, while the frontend is built with React, TypeScript, and Tailwind CSS.

## Features

- **Real-time Messaging:** Send and receive messages instantly using Socket.io.
- **Chat Room Management:** Create and join chat rooms for one-on-one conversations.
- **Typing Indicators:** Visual feedback when another user is typing.
- **Message History:** Load and display previous messages in a chat.
- **Message Editing:** Edit sent messages with real-time updates to all chat participants.
- **Message Deletion:** Soft delete messages with a "This message was deleted" placeholder.
- **Notifications:** Receive notifications for new messages in non-selected chats.
- **Profile Picture Upload:** Upload and update user profile pictures via Cloudinary.
- **Responsive Design:** Mobile-friendly UI with a side drawer for user search.

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- Cloudinary account for image uploads
- Git

### Backend Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ahad324/chatp-app-task.git
   cd chat-app-task/server
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Create a `.env` file** in the `server` directory with the following:
   ```env
   NODE_ENV=development
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/chatapp
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   CLIENT_URL=http://localhost:5173,http://192.168.1.2:5173
   ```
4. **Start the MongoDB server** locally or ensure your cloud MongoDB instance is accessible.
5. **Run the backend in development mode:**
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000`.

### Frontend Setup

1. **Navigate to the client directory:**
   ```bash
   cd chat-app-task/client
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Create a `.env` file** in the `client` directory with the following:
   ```env
   VITE_API_URL=http://192.168.1.2:3000
   ```
4. **Start the frontend in development mode:**
   ```bash
   npm run dev
   ```

The frontend will start on `http://localhost:5173`.

## Socket.io Integration

The application uses Socket.io for real-time communication. The integration is set up as follows:

- **Client-side:** The `socket.io-client` library connects to the backend WebSocket server at the endpoint specified in `VITE_API_URL`.
- **Server-side:** The Socket.io server is initialized with the Express server, configured with a `pingTimeout` of 60 seconds and CORS support for the client URLs.

### Connection Flow:

1. The client connects and emits a `setup` event with user data to join a user-specific room.
2. Users join chat-specific rooms using the `join chat` event.
3. Messages are sent via the `new message` event, stored in MongoDB, and broadcast to all users in the chat room.
4. Message updates and deletions are handled via the `update message` event, ensuring real-time synchronization.
5. Typing indicators are managed with `typing` and `stop typing` events.

## Socket Events

The following Socket.io events are implemented:

- `setup`: Joins the user to a room based on their user ID (`user._id`).
- `join chat`: Joins a specific chat room by `chatId`.
- `typing`: Broadcasts to other users in the chat room that the user is typing.
- `stop typing`: Notifies other users in the chat room that typing has stopped.
- `new message`: Sends a new message to the server, which saves it to MongoDB and broadcasts it to all users in the chat room via `message received`.
- `update message`: Updates an existing message, saves it to MongoDB, and broadcasts the updated message to all users in the chat room via `message updated`.

## Usage Guide

1. **Register/Login:** On the homepage, sign up with a name, email, password, and optional profile picture, or log in with existing credentials.
2. **Search Users:** Use the side drawer to search for users by name or email and start a chat.
3. **Send Messages:** Select a chat, type a message, and press Enter or the send button to send it.
4. **Edit Messages:** Hover over your message, click the menu, and select "Edit" to modify the content.
5. **Delete Messages:** Hover over your message, click the menu, select "Delete," and confirm in the modal. The message will display as "This message was deleted."
6. **View Notifications:** New messages in non-selected chats appear as notifications in the side drawer.
7. **Update Profile Picture:** Open your profile modal and upload a new picture (JPEG/PNG, max 2MB).

## Dependencies

### Backend

- `express`: Web framework for Node.js
- `socket.io`: Real-time communication library
- `mongoose`: MongoDB object modeling
- `jsonwebtoken`: JWT for authentication
- `bcryptjs`: Password hashing
- `cloudinary`: Image storage
- `multer`: File upload handling
- `sharp`: Image processing
- `cors`, `dotenv`, `express-async-handler`: Utilities

### Frontend

- `react`, `react-dom`: React framework
- `socket.io-client`: WebSocket client
- `axios`: HTTP requests
- `react-router-dom`: Client-side routing
- `react-scrollable-feed`: Scrollable chat feed
- `@headlessui/react`: Accessible UI components
- `tailwindcss`: Styling
- `@vitejs/plugin-react`, `typescript`: Development tools
