import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Send, ArrowUpRight, ArrowDownLeft, Activity } from 'lucide-react';
import api from '../api';

const Dashboard = () => {
  const [balance, setBalance] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrCode, setQrCode] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [balanceRes, txRes, qrRes] = await Promise.all([
        api.get('/wallet/balance'),
        api.get('/wallet/transactions'),
        api.get('/wallet/qr').catch(() => ({ data: { qrCode: null } }))
      ]);
      
      setBalance(balanceRes.data.balance || 0);
      setQrCode(qrRes.data.qrCode);
      // Get only top 3 recent transactions
      setRecentTransactions((txRes.data.transactions || []).slice(0, 3));
    } catch (err) {
      setError('Failed to load wallet data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div className="title animate-pulse">Loading wallet data...</div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      <div className="dashboard-grid">
        {/* Left Column: Balance */}
        <div>
          <div className="glass-card balance-card">
            <h2 style={{ color: 'var(--text-muted)', fontSize: '1.25rem', fontWeight: '500' }}>Total Balance</h2>
            <div className="balance-amount">${balance.toFixed(2)}</div>
            
            <div className="action-buttons">
              <Link to="/add-money" className="btn btn-primary">
                <PlusCircle size={20} />
                Add Money
              </Link>
              <Link to="/send-money" className="btn btn-secondary">
                <Send size={20} />
                Send Money
              </Link>
            </div>
          </div>
          
          {qrCode && (
            <div className="glass-card" style={{ marginTop: '24px', textAlign: 'center', padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-muted)' }}>My Receiving QR Code</h3>
              <div style={{ background: 'white', padding: '16px', borderRadius: '12px', display: 'inline-block' }}>
                <img src={qrCode} alt="My Wallet QR Code" style={{ width: '200px', height: '200px' }} />
              </div>
              <p style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Scan to send money securely</p>
            </div>
          )}

          {error && <div className="error-message" style={{ marginTop: '16px' }}>{error}</div>}
        </div>

        {/* Right Column: Recent Activity */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity className="text-secondary" />
              Recent Activity
            </h2>
            <Link to="/transactions" style={{ color: 'var(--primary-color)', fontSize: '0.9rem', fontWeight: '500' }}>
              View All
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              No recent transactions found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {recentTransactions.map((tx) => (
                <div key={tx._id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ 
                      width: '40px', height: '40px', borderRadius: '50%', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: tx.type === 'add' || tx.type === 'receive' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: tx.type === 'add' || tx.type === 'receive' ? 'var(--success)' : 'var(--danger)'
                    }}>
                      {tx.type === 'add' || tx.type === 'receive' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', textTransform: 'capitalize' }}>
                        {tx.type === 'add' ? 'Money Added' : 
                         tx.type === 'send' ? `Sent to ${tx.receiver?.name || tx.receiver?.email || tx.receiver?.phone || 'User'}` : 
                         `Received from ${tx.sender?.name || tx.sender?.email || tx.sender?.phone || 'User'}`}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {new Date(tx.createdAt || tx.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div style={{ 
                    fontWeight: '700', fontSize: '1.1rem',
                    color: tx.type === 'add' || tx.type === 'receive' ? 'var(--success)' : 'var(--danger)'
                  }}>
                    {tx.type === 'add' || tx.type === 'receive' ? '+' : '-'}${tx.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
