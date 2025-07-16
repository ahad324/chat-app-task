import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import Spinner from '../miscellaneous/Spinner';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [confirmpassword, setConfirmpassword] = useState('');
  const [password, setPassword] = useState('');
  const [pic, setPic] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const handlePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPic(e.target.files[0]);
    }
  };

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!name || !email || !password || !confirmpassword) {
      setError('Please fill all the fields');
      setLoading(false);
      return;
    }
    if (password !== confirmpassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    if (pic) {
      formData.append('pic', pic);
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      const { data } = await axios.post(`${serverUrl}/api/user`, formData, config);
      localStorage.setItem('userInfo', JSON.stringify(data));
      setLoading(false);
      navigate('/chats');
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submitHandler} className="flex flex-col space-y-4 pt-4">
      {error && <div className="p-3 bg-red-200 text-red-800 rounded-md">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
        <input
          type="text"
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm"
          placeholder="Enter Your Name"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
        <input
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm"
          placeholder="Enter Your Email"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
        <input
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm"
          placeholder="Enter Password"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
        <input
          type="password"
          onChange={(e) => setConfirmpassword(e.target.value)}
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm"
          placeholder="Confirm Password"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Upload your Picture</label>
        <input
          type="file"
          accept="image/png, image/jpeg"
          onChange={handlePicChange}
          className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-slate-600 file:text-blue-700 dark:file:text-blue-200 hover:file:bg-blue-100 dark:hover:file:bg-slate-500"
        />
      </div>
      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? <Spinner size="sm" color="text-white" /> : 'Sign Up'}
      </button>
    </form>
  );
};

export default Signup;
