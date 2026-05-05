import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import ItemCard from '../components/ItemCard';
import { PlusSquare } from 'lucide-react';

const UserListings = () => {
  const { items, currentUser } = useAppContext();
  const navigate = useNavigate();

  if (!currentUser) {
    return (
      <div className="page-container flex-row-center" style={{ flexDirection: 'column', gap: '15px' }}>
        <p>Please login to view your listings.</p>
        <button onClick={() => navigate('/login')} className="btn-primary" style={{ width: '200px' }}>Login</button>
      </div>
    );
  }

  const userItems = items.filter(i => i.SellerEmail === currentUser.Email);

  return (
    <div className="page-container" style={{ paddingBottom: '90px' }}>
      <div className="flex-row-between" style={{ marginBottom: '20px' }}>
        <h2 style={{ color: 'var(--primary-dark)', margin: 0 }}>My Listings</h2>
        <button onClick={() => navigate('/post-item')} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
          <PlusSquare size={20} /> New
        </button>
      </div>

      {userItems.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '50px', padding: '30px', backgroundColor: 'var(--surface-color)', borderRadius: 'var(--radius-md)' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '15px' }}>You haven't posted any items yet.</p>
          <button onClick={() => navigate('/post-item')} className="btn-primary" style={{ width: 'auto' }}>
            Post Your First Item
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
          {userItems.map(item => (
            <ItemCard key={item.ItemID} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserListings;
