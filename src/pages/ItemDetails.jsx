import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { BadgeCheck, MapPin, MessageSquare, AlertCircle } from 'lucide-react';
import ItemCard from '../components/ItemCard';

const ItemDetails = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { items, currentUser, setChats } = useAppContext();

  const item = items.find(i => i.ItemID === itemId);

  if (!item) {
    return <div className="page-container">Item not found.</div>;
  }

  const recommendedItems = items.filter(i => i.Category === item.Category && i.ItemID !== item.ItemID).slice(0, 2);

  const handleChat = () => {
    if (!currentUser) {
      alert("Please login to chat with the seller.");
      navigate('/login');
      return;
    }

    if (currentUser.Email === item.SellerEmail) {
      alert("You cannot chat with yourself on your own listing!");
      return;
    }

    // Check if chat exists
    setChats(prev => {
      const existing = prev.find(c => c.ItemID === item.ItemID && c.BuyerEmail === currentUser.Email);
      if (existing) {
        navigate(`/chat/${existing.ChatID}`);
        return prev;
      }
      
      const newChatID = Date.now().toString();
      const newChat = {
        ChatID: newChatID,
        ItemID: item.ItemID,
        ItemName: item.ItemName,
        SellerEmail: item.SellerEmail,
        SellerName: item.SellerName,
        BuyerEmail: currentUser.Email,
        Messages: []
      };
      
      setTimeout(() => navigate(`/chat/${newChatID}`), 100);
      return [...prev, newChat];
    });
  };

  return (
    <div className="page-container" style={{ paddingBottom: '90px' }}>
      <button onClick={() => navigate(-1)} className="btn-secondary" style={{ width: 'auto', padding: '8px 16px', marginBottom: '15px' }}>
        &larr; Back
      </button>

      {/* Image */}
      <div style={styles.imageContainer}>
        <img src={item.Image || 'https://via.placeholder.com/400'} alt={item.ItemName} style={styles.image} />
      </div>

      <div className="glass-card" style={styles.detailsCard}>
        <div className="flex-row-between" style={{ marginBottom: '10px' }}>
          <span style={styles.category}>{item.Category}</span>
          <span style={styles.condition}>{item.Condition}</span>
        </div>

        <h1 style={styles.title}>{item.ItemName}</h1>
        
        <div style={styles.priceRow}>
          <span style={styles.price}>
            {item.Price === 0 || item.FreecycleTag ? 'FREE' : `₹${item.Price}`}
          </span>
          {item.FreecycleTag && <span style={styles.freeBadge}>Freecycle</span>}
        </div>

        <p style={styles.description}>{item.Description}</p>

        <div style={styles.locationRow}>
          <MapPin size={18} color="var(--primary-color)" />
          <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '500' }}>
            Meeting Point: {item.PickupLocation} {item.DepartmentPickup ? `(${item.DepartmentPickup})` : ''}
          </span>
        </div>
      </div>

      {/* Seller Profile */}
      <div className="glass-card" style={styles.sellerCard}>
        <h3 style={{ fontSize: '1rem', marginBottom: '12px' }}>Seller Details</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={styles.avatar}>{item.SellerName.charAt(0)}</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontWeight: '600', fontSize: '1rem' }}>{item.SellerName}</span>
              {item.VerifiedBadge && <BadgeCheck size={16} color="var(--primary-color)" />}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {item.SellerDepartment} Dept • ★ {item.SellerRating} Rating
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={handleChat}>
            <MessageSquare size={18} /> Chat with Seller
          </button>
        </div>
      </div>

      {/* Recommendations */}
      {recommendedItems.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '15px' }}>Similar Items</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
            {recommendedItems.map(i => (
              <ItemCard key={i.ItemID} item={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  imageContainer: {
    width: '100%',
    height: '250px',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    marginBottom: '15px',
    boxShadow: 'var(--shadow-sm)'
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  detailsCard: {
    padding: '20px',
    marginBottom: '15px'
  },
  category: {
    fontSize: '0.8rem',
    color: 'var(--primary-color)',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  condition: {
    fontSize: '0.8rem',
    color: 'var(--text-main)',
    backgroundColor: '#eee',
    padding: '2px 8px',
    borderRadius: 'var(--radius-sm)',
    fontWeight: '500'
  },
  title: {
    fontSize: '1.4rem',
    lineHeight: '1.3',
    marginBottom: '8px',
  },
  priceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '15px',
  },
  price: {
    fontSize: '1.6rem',
    fontWeight: '800',
    color: 'var(--primary-dark)',
  },
  freeBadge: {
    backgroundColor: 'var(--success)',
    color: 'white',
    padding: '4px 8px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.8rem',
    fontWeight: 'bold',
  },
  description: {
    fontSize: '0.95rem',
    color: 'var(--text-muted)',
    lineHeight: '1.6',
    marginBottom: '15px',
  },
  locationRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: 'rgba(47, 138, 74, 0.05)',
    borderRadius: 'var(--radius-md)',
  },
  sellerCard: {
    padding: '20px',
  },
  avatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: 'var(--primary-light)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: 'bold',
  }
};

export default ItemDetails;
