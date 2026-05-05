import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck, MapPin } from 'lucide-react';

const ItemCard = ({ item }) => {
  const navigate = useNavigate();

  return (
    <div 
      className="glass-card" 
      style={styles.card} 
      onClick={() => navigate(`/item/${item.ItemID}`)}
    >
      <div style={styles.imageContainer}>
        <img src={item.Image || 'https://via.placeholder.com/150'} alt={item.ItemName} style={styles.image} />
        {item.FreecycleTag && (
          <div style={styles.freeBadge}>FREE</div>
        )}
        {item.LeavingCampusSoonTag && (
          <div style={styles.leavingBadge}>Graduating Soon</div>
        )}
      </div>
      
      <div style={styles.content}>
        <div className="flex-row-between">
          <span style={styles.category}>{item.Category}</span>
          <span style={styles.condition}>{item.Condition}</span>
        </div>
        
        <h3 style={styles.title}>{item.ItemName}</h3>
        
        <div style={styles.priceRow}>
          <span style={styles.price}>
            {item.Price === 0 || item.FreecycleTag ? 'FREE' : `₹${item.Price}`}
          </span>
        </div>

        <div style={styles.locationRow}>
          <MapPin size={14} color="var(--text-muted)" />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {item.PickupLocation} {item.DepartmentPickup ? `(${item.DepartmentPickup})` : ''}
          </span>
        </div>

        <div style={styles.sellerInfo}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={styles.sellerName}>{item.SellerName} ({item.SellerDepartment})</span>
            {item.VerifiedBadge && <BadgeCheck size={14} color="var(--primary-color)" />}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    backgroundColor: 'var(--surface-color)',
    height: '100%',
  },
  imageContainer: {
    position: 'relative',
    height: '140px',
    width: '100%',
    backgroundColor: '#eee',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  freeBadge: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    backgroundColor: 'var(--success)',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: 'bold',
  },
  leavingBadge: {
    position: 'absolute',
    bottom: '8px',
    left: '8px',
    backgroundColor: 'var(--warning)',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: 'bold',
  },
  content: {
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
  },
  category: {
    fontSize: '0.7rem',
    color: 'var(--primary-color)',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  condition: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    backgroundColor: '#f1f1f1',
    padding: '2px 6px',
    borderRadius: 'var(--radius-sm)',
  },
  title: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: 'var(--text-main)',
    margin: '4px 0',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    lineHeight: '1.3',
  },
  priceRow: {
    marginTop: 'auto',
  },
  price: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: 'var(--text-main)',
  },
  locationRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '4px',
  },
  sellerInfo: {
    marginTop: '8px',
    paddingTop: '8px',
    borderTop: '1px solid var(--border-color)',
  },
  sellerName: {
    fontSize: '0.75rem',
    color: 'var(--text-main)',
    fontWeight: '500',
  }
};

export default ItemCard;
