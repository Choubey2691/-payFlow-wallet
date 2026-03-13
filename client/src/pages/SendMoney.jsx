import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Users } from 'lucide-react';
import api from '../api';

const SendMoney = () => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return setError('Please enter a valid amount greater than 0');
    }
    
    if (!recipientEmail) {
      return setError('Please enter a recipient email');
    }

    setLoading(true);

    try {
      await api.post('/wallet/send-money', { 
        recipient: recipientEmail, 
        amount: Number(amount) 
      });
      
      setSuccess(`Successfully sent $${amount} to ${recipientEmail}!`);
      setAmount('');
      setRecipientEmail('');
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to send money. Please verify recipient email and your balance.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(236, 72, 153, 0.1)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--secondary-color)'
          }}>
            <Users size={32} />
          </div>
          <h1 className="title" style={{ fontSize: '1.75rem' }}>Send Money</h1>
          <p className="subtitle">Instantly transfer funds to another PayFlow user</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
          <div className="form-group">
            <label htmlFor="recipientEmail">Recipient (Email or Phone)</label>
            <input
              type="text"
              id="recipientEmail"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="friend@example.com or 9876543210"
              required
              style={{ height: '50px' }}
            />
          </div>

          <div className="form-group" style={{ marginTop: '8px' }}>
            <label htmlFor="amount">Amount ($)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1.25rem' }}>$</span>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0.01"
                step="0.01"
                required
                style={{ paddingLeft: '40px', fontSize: '1.25rem', height: '56px' }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn" 
            disabled={loading} 
            style={{ 
              height: '56px', fontSize: '1.1rem', marginTop: '12px',
              background: 'linear-gradient(135deg, var(--secondary-color), #be185d)',
              color: 'white', border: 'none'
            }}
          >
            <Send size={20} />
            {loading ? 'Processing Transfer...' : 'Send Payment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SendMoney;
