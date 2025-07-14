import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatState } from '../context/ChatProvider';
import SideDrawer from '../components/miscellaneous/SideDrawer';
import MyChats from '../components/MyChats';
import ChatBox from '../components/ChatBox';

const ChatPage = () => {
  const { user } = ChatState();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) {
    return null; // Or a loading spinner
  }

  return (
    <div className="w-full h-screen flex flex-col">
      <SideDrawer />
      <div className="flex h-full w-full overflow-hidden">
        <MyChats />
        <ChatBox />
      </div>
    </div>
  );
};

export default ChatPage;
