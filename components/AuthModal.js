import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, enableBrowseOnly } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = login(password);
    if (!success) setError('Incorrect password');
  };

  return (
    <div className="fixed inset-0 bg-gray-700 bg-opacity-70 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow-lg flex flex-col gap-4"
      >
        <h2 className="text-lg font-bold text-center mb-1">Plants de Louton</h2>
        <h4 className="text-md text-center mb-1">Enter password</h4>
        <input
          type="password"
          className="w-full border border-black px-4 py-2 rounded mb-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
          Enter
        </button>

        <button
          onClick={enableBrowseOnly}
          className="text-md text-gray-600 hover:underline mt-1"
          type="button"
        >
          Just here to browse
        </button>
      </form>
    </div>
  );
}