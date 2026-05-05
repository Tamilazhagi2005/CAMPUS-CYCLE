import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import ItemCard from '../components/ItemCard';
import { Search, Filter, TrendingUp, DollarSign, Recycle } from 'lucide-react';

const CATEGORIES = ['All', 'Books', 'Electronics', 'Hostel Items', 'Lab Equipment', 'Others'];

const Home = () => {
  const { items, stats } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredItems = items.filter(item => {
    const matchesSearch = item.ItemName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.Category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const freecycleItems = items.filter(item => item.FreecycleTag);
  const graduatingItems = items.filter(item => item.LeavingCampusSoonTag);

  return (
    <div className="page-container" style={{ paddingBottom: '90px' }}>
      {/* Header section */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ color: 'var(--primary-dark)', fontSize: '1.8rem', marginBottom: '5px' }}>CampusCycle</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Sona College Marketplace</p>
      </div>

      {/* Sustainable Impact Tracker */}
      <div className="glass-card" style={styles.statsContainer}>
        <div style={styles.statBox}>
          <Recycle size={20} color="var(--success)" />
          <div style={styles.statValue}>{stats.ItemsReused}+</div>
          <div style={styles.statLabel}>Items Reused</div>
        </div>
        <div style={styles.statBox}>
          <DollarSign size={20} color="var(--primary-color)" />
          <div style={styles.statValue}>₹{stats.MoneySaved.toLocaleString()}</div>
          <div style={styles.statLabel}>Money Saved</div>
        </div>
        <div style={styles.statBox}>
          <TrendingUp size={20} color="var(--warning)" />
          <div style={styles.statValue}>{stats.WastePrevented}kg</div>
          <div style={styles.statLabel}>Waste Prevented</div>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: '15px' }}>
        <input 
          type="text" 
          placeholder="Search items..." 
          className="input-field"
          style={{ paddingLeft: '40px' }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
      </div>

      {/* Categories */}
      <div style={styles.categoriesContainer}>
        {CATEGORIES.map(cat => (
          <button 
            key={cat}
            style={{
              ...styles.categoryPill,
              backgroundColor: activeCategory === cat ? 'var(--primary-color)' : 'white',
              color: activeCategory === cat ? 'white' : 'var(--text-main)',
              border: activeCategory === cat ? 'none' : '1px solid var(--border-color)',
            }}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Sections */}
      {searchQuery === '' && activeCategory === 'All' ? (
        <>
          {freecycleItems.length > 0 && (
            <Section title="Freecycle (100% Free)" items={freecycleItems} />
          )}
          {graduatingItems.length > 0 && (
            <Section title="Graduating Soon Sale" items={graduatingItems} />
          )}
          <Section title="Recommended Items" items={items} />
        </>
      ) : (
        <Section title="Search Results" items={filteredItems} />
      )}

    </div>
  );
};

const Section = ({ title, items }) => {
  if (items.length === 0) return null;

  return (
    <div style={{ marginBottom: '25px' }}>
      <h3 style={{ marginBottom: '15px', fontSize: '1.1rem' }}>{title}</h3>
      <div style={styles.grid}>
        {items.map(item => (
          <ItemCard key={item.ItemID || item.id || Math.random().toString()} item={item} />
        ))}
      </div>
    </div>
  );
};

const styles = {
  statsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '15px',
    marginBottom: '20px',
    backgroundColor: 'var(--primary-light)',
    color: 'white',
    backgroundImage: 'linear-gradient(135deg, var(--primary-color), #20713b)',
    border: 'none',
  },
  statBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontWeight: '700',
    fontSize: '1.2rem',
    marginTop: '4px',
  },
  statLabel: {
    fontSize: '0.7rem',
    opacity: 0.9,
  },
  categoriesContainer: {
    display: 'flex',
    gap: '10px',
    overflowX: 'auto',
    paddingBottom: '10px',
    marginBottom: '15px',
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
  },
  categoryPill: {
    padding: '8px 16px',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.85rem',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '15px',
  }
};

export default Home;
