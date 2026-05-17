import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

const MyListings = () => {
  const { currentUser } = useAppContext();
  const [activeListings, setActiveListings] = useState([]);
  const [soldListings, setSoldListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.Email) return;

    setLoading(true);

    const qActive = query(
      collection(db, 'Items'),
      where('SellerEmail', '==', currentUser.Email),
      where('Status', '==', 'Active'),
      orderBy('DatePosted', 'desc')
    );

    const qSold = query(
      collection(db, 'Items'),
      where('SellerEmail', '==', currentUser.Email),
      where('Status', '==', 'Sold'),
      orderBy('SoldAt', 'desc')
    );

    const unsubActive = onSnapshot(qActive, (snap) => {
      setActiveListings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => { console.error('Active listings listener', err); setLoading(false); });

    const unsubSold = onSnapshot(qSold, (snap) => {
      setSoldListings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => { console.error('Sold listings listener', err); setLoading(false); });

    return () => { unsubActive(); unsubSold(); };
  }, [currentUser?.Email]);

  const markSold = async (itemId) => {
    try {
      await updateDoc(doc(db, 'Items', itemId), { Status: 'Sold', SoldAt: serverTimestamp() });
    } catch (err) {
      console.error('Mark sold failed', err);
      alert('Failed to mark sold');
    }
  };

  const removeItem = async (itemId) => {
    if (!confirm('Delete this listing? This action cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'Items', itemId));
    } catch (err) {
      console.error('Delete item failed', err);
      alert('Failed to delete item');
    }
  };

  if (!currentUser) {
    return (
      <div className="page-container flex-row-center" style={{ flexDirection: 'column', gap: '15px' }}>
        <p>Please login to view your listings.</p>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ paddingBottom: '90px' }}>
      <h2 style={{ marginBottom: '16px' }}>My Listings</h2>

      {loading && <div>Loading listings...</div>}

      <section style={{ marginTop: '12px' }}>
        <h3>Active Listings</h3>
        {activeListings.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No active listings.</p>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {activeListings.map(item => (
              <div key={item.id} className="glass-card" style={{ padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center' }}>
                  <div>
                    <strong>{item.ItemName}</strong>
                    <div style={{ color: 'var(--text-muted)' }}>{item.Price === 0 ? 'FREE' : `₹${item.Price}`}</div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-secondary" onClick={() => markSold(item.id)}>Mark Sold</button>
                    <button className="btn-link" onClick={() => removeItem(item.id)} style={{ color: 'var(--error)' }}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section style={{ marginTop: '24px' }}>
        <h3>Sold Listings</h3>
        {soldListings.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No sold listings.</p>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {soldListings.map(item => (
              <div key={item.id} className="glass-card" style={{ padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center' }}>
                  <div>
                    <strong>{item.ItemName}</strong>
                    <div style={{ color: 'var(--text-muted)' }}>Sold</div>
                  </div>

                  <div>
                    <button className="btn-link" onClick={() => removeItem(item.id)} style={{ color: 'var(--error)' }}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default MyListings;
