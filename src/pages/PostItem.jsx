import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Sparkles, Image as ImageIcon } from 'lucide-react';
import { db, storage } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const CATEGORIES = ['Books', 'Electronics', 'Hostel Items', 'Lab Equipment', 'Others'];
const CONDITIONS = ['New', 'Good', 'Used'];
const BASIC_LOCATIONS = ['Library', 'Main Gate', 'Boys Hostel', 'Girls Hostel', 'Canteen', 'Sports Complex', 'Department Blocks'];

const DEPARTMENTS = [
  'Artificial Intelligence and Data Science (ADS)',
  'Computer Science and Engineering (CSE)',
  'Information Technology (IT)',
  'Electronics and Communication Engineering (ECE)',
  'Electrical and Electronics Engineering (EEE)',
  'Mechanical Engineering (MECH)',
  'Civil Engineering (CIVIL)',
  'Fashion Technology (FT)',
  'Textile Technology (TT)'
];

const PostItem = () => {
  const { currentUser, setItems } = useAppContext();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    ItemName: '',
    Category: '',
    Condition: '',
    Price: '',
    Description: '',
    PickupLocation: '',
    DepartmentPickup: '',
    FreecycleTag: false,
    LeavingCampusSoonTag: false
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestedPrice, setSuggestedPrice] = useState(null);

  // Auto-suggest Graduating Sale
  useEffect(() => {
    if (currentUser && currentUser.GraduatingSoonStatus) {
      setFormData(prev => ({ ...prev, LeavingCampusSoonTag: true }));
    }
  }, [currentUser]);

  // AI Smart Price Suggestion Logic (Mock)
  useEffect(() => {
    if (formData.Category && formData.Condition && !formData.FreecycleTag) {
      let base = 0;
      switch (formData.Category) {
        case 'Electronics': base = 1500; break;
        case 'Lab Equipment': base = 300; break;
        case 'Books': base = 250; break;
        case 'Hostel Items': base = 500; break;
        case 'Others': base = 200; break;
        default: base = 100;
      }
      
      let multiplier = 1;
      if (formData.Condition === 'New') multiplier = 0.9;
      if (formData.Condition === 'Good') multiplier = 0.6;
      if (formData.Condition === 'Used') multiplier = 0.4;
      
      const suggested = Math.floor(base * multiplier);
      setSuggestedPrice(`₹${suggested - 50} - ₹${suggested + 50}`);
    } else {
      setSuggestedPrice(null);
    }
  }, [formData.Category, formData.Condition, formData.FreecycleTag]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setFormData(prev => {
      let data = { ...prev, [name]: val };
      
      // Dynamic logic
      if (name === 'FreecycleTag' && val === true) {
        data.Price = 0;
      }
      if (name === 'PickupLocation' && value !== 'Department Blocks') {
        data.DepartmentPickup = '';
      }
      return data;
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("Please login first to post an item.");
      navigate('/login');
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = 'https://via.placeholder.com/300'; // Default
      
      // 1. Upload Image to Firebase Storage if a file was selected
      if (imageFile) {
        const imageRef = ref(storage, `items/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      // 2. Save Item Data to Firestore
      const newItem = {
        ...formData,
        SellerEmail: currentUser.Email,
        SellerName: currentUser.Name,
        SellerDepartment: currentUser.Department,
        SellerRating: currentUser.SellerRating || 5.0,
        VerifiedBadge: currentUser.VerifiedBadge || true,
        Price: Number(formData.Price) || 0,
        DatePosted: new Date().toISOString(),
        Status: 'Active',
        Image: imageUrl
      };

      await addDoc(collection(db, "Items"), newItem);

      // We don't need to update local state necessarily if AppContext has an onSnapshot listener, 
      // but if not, we would normally do it here. We'll set up the listener next.
      
      alert("Item posted successfully!");
      navigate('/home');
    } catch (error) {
      console.error("Error posting item:", error);
      alert("Failed to post item. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container" style={{ paddingBottom: '90px' }}>
      <div className="glass-card" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '20px', color: 'var(--primary-dark)' }}>Post New Item</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div>
            <label style={styles.label}>Item Name</label>
            <input type="text" name="ItemName" className="input-field" value={formData.ItemName} onChange={handleChange} required />
          </div>

          <div>
            <label style={styles.label}>Category</label>
            <select name="Category" className="input-field" value={formData.Category} onChange={handleChange} required>
              <option value="">Select Category</option>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div>
            <label style={styles.label}>Condition</label>
            <select name="Condition" className="input-field" value={formData.Condition} onChange={handleChange} required>
              <option value="">Select Condition</option>
              {CONDITIONS.map(cond => <option key={cond} value={cond}>{cond}</option>)}
            </select>
          </div>

          {/* AI Smart Price Suggestion */}
          {suggestedPrice && !formData.FreecycleTag && (
            <div style={styles.aiBox}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Sparkles size={16} color="var(--primary-color)" />
                <strong style={{ fontSize: '0.85rem', color: 'var(--primary-dark)' }}>AI Suggested Price</strong>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', margin: 0 }}>
                Based on similar items: <strong>{suggestedPrice}</strong>
              </p>
            </div>
          )}

          <div>
            <label style={styles.label}>Price (₹) {formData.FreecycleTag && '(Disabled - Freecycle)'}</label>
            <input 
              type="number" 
              name="Price" 
              className="input-field" 
              value={formData.Price} 
              onChange={handleChange} 
              disabled={formData.FreecycleTag}
              required={!formData.FreecycleTag}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" name="FreecycleTag" checked={formData.FreecycleTag} onChange={handleChange} />
              <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Mark as Free (Freecycle)</span>
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" name="LeavingCampusSoonTag" checked={formData.LeavingCampusSoonTag} onChange={handleChange} />
              <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Leaving Campus Soon (Graduating Sale)</span>
            </label>
          </div>

          <div>
            <label style={styles.label}>Pickup Location</label>
            <select name="PickupLocation" className="input-field" value={formData.PickupLocation} onChange={handleChange} required>
              <option value="">Select Location</option>
              {BASIC_LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>

          {formData.PickupLocation === 'Department Blocks' && (
            <div style={{ padding: '10px', backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 'var(--radius-md)' }}>
              <label style={styles.label}>Select Department Block</label>
              <select name="DepartmentPickup" className="input-field" value={formData.DepartmentPickup} onChange={handleChange} required>
                <option value="">Select Department</option>
                {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
              </select>
            </div>
          )}

          <div>
            <label style={styles.label}>Description</label>
            <textarea name="Description" className="input-field" rows="3" value={formData.Description} onChange={handleChange} required />
          </div>

          <div>
            <label style={styles.label}>Item Image</label>
            <div style={{
              border: '2px dashed var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              textAlign: 'center',
              backgroundColor: 'var(--surface-color)',
              position: 'relative'
            }}>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                style={{ 
                  position: 'absolute', 
                  top: 0, left: 0, width: '100%', height: '100%', 
                  opacity: 0, cursor: 'pointer' 
                }}
              />
              {imagePreview ? (
                <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto' }}>
                  <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                </div>
              ) : (
                <>
                  <ImageIcon size={32} color="var(--text-muted)" style={{ marginBottom: '10px' }} />
                  <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.9rem' }}>Click or drag image to upload</p>
                </>
              )}
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ marginTop: '10px' }}>
            {isSubmitting ? 'Posting...' : 'Post Listing'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  label: {
    display: 'block',
    marginBottom: '6px',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--text-main)'
  },
  aiBox: {
    backgroundColor: 'var(--surface-color)',
    border: '1px solid var(--primary-light)',
    borderRadius: 'var(--radius-md)',
    padding: '12px',
    boxShadow: '0 2px 4px rgba(47, 138, 74, 0.1)',
  }
};

export default PostItem;
