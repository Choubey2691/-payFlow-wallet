import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Wallet, LogOut, PlusCircle, Send, List } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link to="/" className="brand">
          <Wallet className="brand-icon" size={28} />
          <span>PayFlow</span>
        </Link>
        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Dashboard
          </Link>
          <Link 
            to="/add-money" 
            className={`nav-link ${location.pathname === '/add-money' ? 'active' : ''}`}
          >
            Add Money
          </Link>
          <Link 
            to="/send-money" 
            className={`nav-link ${location.pathname === '/send-money' ? 'active' : ''}`}
          >
            Send Money
          </Link>
          <Link 
            to="/transactions" 
            className={`nav-link ${location.pathname === '/transactions' ? 'active' : ''}`}
          >
            Transactions
          </Link>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '8px 16px' }}>
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
