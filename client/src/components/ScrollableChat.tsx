import React, { Fragment } from 'react';
import ScrollableFeed from 'react-scrollable-feed';
import { Menu, Transition } from '@headlessui/react';
import { isLastMessage, isSameSender, isSameSenderMargin, isSameUser } from '../config/chatLogics';
import { ChatState } from '../context/ChatProvider';
import { Message } from '../types';

interface ScrollableChatProps {
    messages: Message[];
    onEdit: (message: Message) => void;
    onDelete: (messageId: string) => void;
}

const DotsVerticalIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
    </svg>
);

const MessageMenu = ({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) => (
    <Menu as="div" className="relative inline-block text-left">
        <div>
            <Menu.Button className="flex items-center rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-slate-800">
                <span className="sr-only">Open options</span>
                <DotsVerticalIcon />
            </Menu.Button>
        </div>
        <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
        >
            <Menu.Items className="absolute bottom-full right-0 mb-1 z-20 w-32 origin-bottom-right rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="px-1 py-1">
                    <Menu.Item>
                        {({ active }) => (
                            <button onClick={onEdit} className={`${active ? 'bg-blue-500 text-white' : 'text-gray-900 dark:text-gray-200'} group flex w-full items-center rounded-md px-2 py-2 text-sm`}>
                                Edit
                            </button>
                        )}
                    </Menu.Item>
                    <Menu.Item>
                        {({ active }) => (
                            <button onClick={onDelete} className={`${active ? 'bg-red-500 text-white' : 'text-gray-900 dark:text-gray-200'} group flex w-full items-center rounded-md px-2 py-2 text-sm`}>
                                Delete
                            </button>
                        )}
                    </Menu.Item>
                </div>
            </Menu.Items>
        </Transition>
    </Menu>
);

const ScrollableChat = ({ messages, onEdit, onDelete }: ScrollableChatProps) => {
  const { user } = ChatState();

  return (
    <ScrollableFeed>
      {messages &&
        messages.map((m, i) => (
          <div style={{ display: 'flex' }} key={m._id} className="group items-end my-1">
            {/* {(isSameSender(messages, m, i, user?._id || '') ||
              isLastMessage(messages, i, user?._id || '')) && (
                 <img
                    className="w-8 h-8 rounded-full cursor-pointer mr-1 self-end"
                    src={m.sender.pic}
                    alt={m.sender.name}
                 />
            )} */}
             <div className={`flex items-center ${m.sender._id === user?._id ? 'ml-auto' : ''} min-w-0`}>
                <span
                    style={{
                        backgroundColor: `${
                        m.sender._id === user?._id ? '#BFDBFE' : '#F0F0F0'
                        }`,
                        color: `${
                        m.sender._id === user?._id ? '#1E40AF' : '#1F2937'
                        }`,
                    }}
                    className={`dark:bg-slate-700 dark:text-gray-200 inline-block ml-[${isSameSenderMargin(messages, m, i, user?._id || '')}px] mt-${isSameUser(messages, m, i) ? '1' : '2'} rounded-xl px-3 py-2 max-w-xs md:max-w-md break-words`}
                >
                {m.isDeleted ? <i className="text-gray-500 dark:text-gray-400">This message was deleted</i> : m.content}
                </span>

                 {m.sender._id === user?._id && !m.isDeleted && (
                    <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity self-center">
                        <MessageMenu onEdit={() => onEdit(m)} onDelete={() => onDelete(m._id)} />
                    </div>
                 )}
            </div>
          </div>
        ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;