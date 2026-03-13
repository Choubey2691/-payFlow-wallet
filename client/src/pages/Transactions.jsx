import { useState, useEffect } from 'react';
import { List, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import api from '../api';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/wallet/transactions');
      setTransactions(response.data.transactions || []);
    } catch (err) {
      setError('Failed to load transactions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div className="title animate-pulse">Loading transactions...</div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ marginTop: '40px' }}>
      <div className="glass-card" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <div style={{ 
            width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)'
          }}>
            <List size={24} />
          </div>
          <div>
            <h1 className="title" style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Transaction History</h1>
            <p className="subtitle" style={{ marginBottom: 0 }}>View all your past wallet activity</p>
          </div>
        </div>

        {error && <div className="error-message" style={{ marginBottom: '20px' }}>{error}</div>}

        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            No transactions found. Adding or sending money will appear here.
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Details</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id} style={{ transition: 'background 0.2s', cursor: 'default' }} 
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ 
                          width: '32px', height: '32px', borderRadius: '50%', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: tx.type === 'add' || tx.type === 'receive' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: tx.type === 'add' || tx.type === 'receive' ? 'var(--success)' : 'var(--danger)'
                        }}>
                          {tx.type === 'add' || tx.type === 'receive' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                        </div>
                        <span style={{ textTransform: 'capitalize', fontWeight: '500' }}>{tx.type}</span>
                      </div>
                    </td>
                    <td style={{ 
                      fontWeight: '700',
                      color: tx.type === 'add' || tx.type === 'receive' ? 'var(--success)' : 'var(--danger)'
                    }}>
                      {tx.type === 'add' || tx.type === 'receive' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {new Date(tx.createdAt || tx.date).toLocaleString()}
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {tx.type === 'send' ? `Sent to ${tx.receiver?.email || tx.receiver?.phone}` : 
                       tx.type === 'receive' ? `Received from ${tx.sender?.email || tx.sender?.phone}` : 
                       'Wallet Deposit'}
                    </td>
                    <td>
                      <span className={`badge badge-success`}>Completed</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
