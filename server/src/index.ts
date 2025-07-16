import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { Server } from 'socket.io';
import connectDB from './config/db';
import userRoutes from './routes/userRoutes';
import chatRoutes from './routes/chatRoutes';
import messageRoutes from './routes/messageRoutes';
import { notFound, errorHandler } from './middleware/errorMiddleware';

dotenv.config();
connectDB();

const app = express();

const corsOptions = {
  origin: process.env.CLIENT_URL?.split(','),
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Middleware to attach io instance to request
app.use((req: Request, res: Response, next) => {
  (req as any).io = io;
  next();
});

app.get('/', (req: Request, res: Response) => {
  res.send('API is running...');
});

app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`));

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.CLIENT_URL?.split(','),
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('Connected to socket.io');

  socket.on('setup', (userData) => {
    socket.join(userData._id);
    socket.emit('connected');
  });

  socket.on('join chat', (room) => {
    socket.join(room);
    console.log('User Joined Room: ' + room);
  });

  socket.on('typing', (room) => socket.in(room).emit('typing'));
  socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));

  socket.on('new message', (newMessageRecieved) => {
    const chat = newMessageRecieved.chat;
    if (!chat.users) return console.log('chat.users not defined');

    chat.users.forEach((user: any) => {
      if (user._id == newMessageRecieved.sender._id) return;
      socket.in(user._id).emit('message recieved', newMessageRecieved);
    });
  });

  socket.on('disconnect', () => {
    console.log('USER DISCONNECTED');
  });
});
