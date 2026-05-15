import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { BadgeCheck, MapPin, MessageSquare } from 'lucide-react';
import ItemCard from '../components/ItemCard';

const ItemDetails = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { items, currentUser, setChats } = useAppContext();

  const item = items.find(i => i.ItemID === itemId);

  if (!item) {
    return <div className="page-container">Item not found.</div>;
  }

  const recommendedItems = items
    .filter(i => i.Category === item.Category && i.ItemID !== item.ItemID)
    .slice(0, 2);

  const handleChat = () => {
    if (!currentUser) {
      alert("Please login to chat with seller.");
      navigate('/login');
      return;
    }

    if (currentUser.Email === item.SellerEmail) {
      alert("You cannot chat with yourself.");
      return;
    }

    setChats(prev => {
      const existing = prev.find(
        c => c.ItemID === item.ItemID && c.BuyerEmail === currentUser.Email
      );

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
        SellerDepartment: item.SellerDepartment,
        SellerRating: item.SellerRating,

        BuyerEmail: currentUser.Email,
        BuyerName: currentUser.Name,
        BuyerDepartment: currentUser.Department,
        BuyerYear: currentUser.GraduatingYear,
        BuyerProfileImage: currentUser.ProfileImage || "",

        Messages: [
          {
            MsgID: Date.now().toString(),
            Sender: currentUser.Email,
            SenderName: currentUser.Name,
            Text: "Hi, is this still available?",
            Timestamp: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })
          }
        ]
      };

      setTimeout(() => navigate(`/chat/${newChatID}`), 100);
      return [...prev, newChat];
    });
  };

  return (
    <div className="page-container" style={{ paddingBottom: '90px' }}>
      <button
        onClick={() => navigate(-1)}
        className="btn-secondary"
        style={{
          width: 'auto',
          padding: '8px 16px',
          marginBottom: '15px'
        }}
      >
        ← Back
      </button>

      <div style={styles.imageContainer}>
        <img
          src={item.Image || 'https://via.placeholder.com/400'}
          alt={item.ItemName}
          style={styles.image}
        />
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
          {item.FreecycleTag && (
            <span style={styles.freeBadge}>Freecycle</span>
          )}
        </div>

        <p style={styles.description}>{item.Description}</p>

        <div style={styles.locationRow}>
          <MapPin size={18} color="var(--primary-color)" />
          <span>
            Meeting Point: {item.PickupLocation}
            {item.DepartmentPickup ? ` (${item.DepartmentPickup})` : ''}
          </span>
        </div>
      </div>

      <div className="glass-card" style={styles.sellerCard}>
        <h3>Seller Details</h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={styles.avatar}>
            {item.SellerName.charAt(0)}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{item.SellerName}</span>
              {item.VerifiedBadge && (
                <BadgeCheck size={16} color="var(--primary-color)" />
              )}
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {item.SellerDepartment} Dept • ★ {item.SellerRating}
            </div>
          </div>
        </div>

        <button
          className="btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '20px'
          }}
          onClick={handleChat}
        >
          <MessageSquare size={18} />
          Chat with Seller
        </button>
      </div>

      {recommendedItems.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3>Similar Items</h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '15px'
            }}
          >
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
    borderRadius: '16px',
    overflow: 'hidden',
    marginBottom: '15px'
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
    color: 'green',
    fontWeight: '700'
  },
  condition: {
    background: '#eee',
    padding: '4px 8px',
    borderRadius: '8px'
  },
  title: {
    fontSize: '1.4rem'
  },
  priceRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  },
  price: {
    fontSize: '1.6rem',
    fontWeight: '800'
  },
  freeBadge: {
    background: 'green',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '8px'
  },
  description: {
    marginTop: '10px'
  },
  locationRow: {
    display: 'flex',
    gap: '8px',
    marginTop: '15px'
  },
  sellerCard: {
    padding: '20px'
  },
  avatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'green',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};

export default ItemDetails;