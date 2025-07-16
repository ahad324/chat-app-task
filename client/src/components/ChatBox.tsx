import { ChatState } from '../context/ChatProvider';
import SingleChat from './SingleChat';

const ChatBox = () => {
  const { selectedChat } = ChatState();

  return (
    <div
      className={`items-center flex-col p-3 bg-white dark:bg-slate-800 w-full md:w-2/3 rounded-lg border dark:border-slate-700 ${selectedChat ? 'flex' : 'hidden md:flex'}`}
    >
      {selectedChat ? (
        <SingleChat />
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className="text-2xl pb-3 font-work-sans text-gray-500">Click on a user to start chatting</p>
        </div>
      )}
    </div>
  );
};

export default ChatBox;
