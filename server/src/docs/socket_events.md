# Socket.IO Events Documentation

This document outlines the Socket.IO events used in the real-time chat application.

## Connection

### `connection`
- **Purpose:** Fired when a client successfully connects to the server.
- **Payload:** `socket` - The socket object for the connected client.

### `setup`
- **Purpose:** Sent by the client after connection to authenticate and set up the user-specific room.
- **Payload:** `userData` - The user object from the client.
- **Server Logic:** The server joins the socket to a room identified by the user's ID (`userData._id`).

### `connected`
- **Purpose:** Emitted by the server to the client to confirm that the `setup` process is complete.
- **Payload:** None.

### `disconnect`
- **Purpose:** Fired when a client disconnects from the server.
- **Payload:** None.

## Chat Room Management

### `join chat`
- **Purpose:** Sent by the client to join a specific chat room.
- **Payload:** `room` - The ID of the chat room to join.
- **Server Logic:** The server joins the socket to the specified room.

## Messaging

### `new message`
- **Purpose:** Sent by the client when a new message is sent.
- **Payload:** `newMessageRecieved` - The new message object.
- **Server Logic:** The server broadcasts the `message recieved` event to all users in the chat, except the sender.

### `message recieved`
- **Purpose:** Emitted by the server to clients in a chat room when a new message is received.
- **Payload:** `newMessageRecieved` - The new message object.

### `message updated`
- **Purpose:** Emitted by the server when a message is updated.
- **Payload:** `updatedMessage` - The updated message object.
- **Server Logic:** The server broadcasts this event to all users in the chat room.

### `message deleted`
- **Purpose:** Emitted by the server when a message is deleted.
- **Payload:** `deletedMessage` - The deleted message object (with `isDeleted` flag set to true).
- **Server Logic:** The server broadcasts this event to all users in the chat room.

## Typing Indicators

### `typing`
- **Purpose:** Sent by the client when the user starts typing.
- **Payload:** `room` - The ID of the chat room where the user is typing.
- **Server Logic:** The server broadcasts the `typing` event to other users in the room.

### `stop typing`
- **Purpose:** Sent by the client when the user stops typing.
- **Payload:** `room` - The ID of the chat room.
- **Server Logic:** The server broadcasts the `stop typing` event to other users in the room.
