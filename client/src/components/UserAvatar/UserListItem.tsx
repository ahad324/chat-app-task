import React from 'react';
import { User } from '../../types';

interface UserListItemProps {
  user: User;
  handleFunction: () => void;
}

const UserListItem: React.FC<UserListItemProps> = ({ user, handleFunction }) => {
  return (
    <div
      onClick={handleFunction}
      className="cursor-pointer bg-gray-100 hover:bg-blue-500 hover:text-white w-full flex items-center text-black dark:bg-slate-700 dark:text-white dark:hover:bg-blue-500 px-3 py-2 mb-2 rounded-lg"
    >
      <img className="mr-2 w-8 h-8 rounded-full" src={user.pic} alt={user.name} />
      <div>
        <p className="font-semibold">{user.name}</p>
        <p className="text-xs">
          <b>Email : </b>
          {user.email}
        </p>
      </div>
    </div>
  );
};

export default UserListItem;
