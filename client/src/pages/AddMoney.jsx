import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, CreditCard } from 'lucide-react';
import api from '../api';

const AddMoney = () => {
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

    setLoading(true);

    try {
      await api.post('/wallet/add-money', { amount: Number(amount) });
      setSuccess(`Successfully added $${amount} to your wallet!`);
      setAmount('');
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add money. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--primary-color)'
          }}>
            <CreditCard size={32} />
          </div>
          <h1 className="title" style={{ fontSize: '1.75rem' }}>Add Money</h1>
          <p className="subtitle">Deposit funds into your secure wallet</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '20px' }}>
          <div className="form-group">
            <label htmlFor="amount">Amount ($)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '1.25rem' }}>$</span>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="1"
                step="0.01"
                required
                style={{ paddingLeft: '40px', fontSize: '1.25rem', height: '56px' }}
              />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              Minimum deposit is $1.00
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '8px' }}>
            {[10, 50, 100].map(val => (
              <button 
                key={val} 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => setAmount(val.toString())}
                style={{ padding: '8px' }}
              >
                +${val}
              </button>
            ))}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ height: '56px', fontSize: '1.1rem' }}>
            <PlusCircle size={24} />
            {loading ? 'Processing...' : `Add Funds`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMoney;
