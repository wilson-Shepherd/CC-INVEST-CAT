import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BASE_URL = 'http://localhost:3000';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !email || !password) {
      setError('請填寫所有欄位');
      return;
    }

    try {
      await axios.post(`${BASE_URL}/api/user/register`, { username, email, password });
      alert('註冊成功!');
      navigate('/login');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || '發生未知錯誤';
      setError('註冊失敗。' + errorMessage);
    }
  };

  return (
    <div>
      <h2>註冊</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleRegister}>
        <div>
          <label>使用者名稱</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div>
          <label>電子郵件</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>密碼</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">註冊</button>
      </form>
    </div>
  );
};

export default Register;