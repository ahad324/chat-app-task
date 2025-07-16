import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tab } from '@headlessui/react';
import Login from '../components/authentication/Login';
import Signup from '../components/authentication/Signup';

function classNames(...classes: (string | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}

const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('userInfo') || 'null');
    if (user) {
      navigate('/chats');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl text-center p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Real-Time Chat</h1>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6">
          <Tab.Group>
            <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
              <Tab
                className={({ selected }) =>
                  classNames(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700 dark:text-blue-300',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                    selected
                      ? 'bg-white dark:bg-slate-700 shadow'
                      : 'text-blue-100 hover:bg-white/[0.12] hover:text-white',
                  )
                }
              >
                Login
              </Tab>
              <Tab
                className={({ selected }) =>
                  classNames(
                    'w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700 dark:text-blue-300',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                    selected
                      ? 'bg-white dark:bg-slate-700 shadow'
                      : 'text-blue-100 hover:bg-white/[0.12] hover:text-white',
                  )
                }
              >
                Sign Up
              </Tab>
            </Tab.List>
            <Tab.Panels className="mt-2">
              <Tab.Panel>
                <Login />
              </Tab.Panel>
              <Tab.Panel>
                <Signup />
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
