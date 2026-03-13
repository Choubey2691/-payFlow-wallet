import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Wallet, LogIn } from 'lucide-react';
import api from '../api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-card auth-card animate-fade-in">
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <Wallet className="brand-icon" size={48} style={{ margin: '0 auto 16px' }} />
          <h1 className="title">Welcome Back</h1>
          <p className="subtitle">Login to your PayFlow wallet</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '10px' }}>
            <LogIn size={20} />
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '16px', fontSize: '0.9rem' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary-color)', fontWeight: '600' }}>Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
