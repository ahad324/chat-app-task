
export interface User {
    _id: string;
    name: string;
    email: string;
    pic: string;
    token?: string;
}

export interface Message {
    _id: string;
    sender: User;
    content: string;
    chat: Chat;
    isDeleted?: boolean;
}

export interface Chat {
    _id: string;
    chatName: string;
    isGroupChat: boolean;
    users: User[];
    latestMessage?: Message;
    groupAdmin?: User;
}
