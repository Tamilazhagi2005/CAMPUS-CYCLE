import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Sparkles, Image as ImageIcon } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

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

  useEffect(() => {
    if (currentUser && currentUser.GraduatingSoonStatus) {
      setFormData(prev => ({ ...prev, LeavingCampusSoonTag: true }));
    }
  }, [currentUser]);

  useEffect(() => {
    if (formData.Category && formData.Condition && !formData.FreecycleTag) {
      let base = 0;

      switch (formData.Category) {
        case 'Electronics':
          base = 1500;
          break;
        case 'Lab Equipment':
          base = 300;
          break;
        case 'Books':
          base = 250;
          break;
        case 'Hostel Items':
          base = 500;
          break;
        default:
          base = 200;
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

      if (name === 'FreecycleTag' && checked) {
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
      alert("Please login first.");
      navigate("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = "https://via.placeholder.com/300";

      if (imageFile) {
        const cloudData = new FormData();
        cloudData.append("file", imageFile);
        cloudData.append("upload_preset", "campuscycle_upload");

        const response = await fetch(
          "https://api.cloudinary.com/v1_1/dno433imc/image/upload",
          {
            method: "POST",
            body: cloudData,
          }
        );

        const data = await response.json();

        if (!data.secure_url) {
          throw new Error("Image upload failed");
        }

        imageUrl = data.secure_url;
      }

      const newItem = {
        ...formData,
        ItemID: Date.now().toString(),
        SellerEmail: currentUser?.Email || "",
        SellerName: currentUser?.Name || "",
        SellerDepartment: currentUser?.Department || "",
        SellerRating: currentUser?.SellerRating || 5.0,
        VerifiedBadge: true,
        Price: Number(formData.Price) || 0,
        DatePosted: new Date().toISOString(),
        Status: 'Active',
        Image: imageUrl
      };

      await addDoc(collection(db, "Items"), newItem);

      setItems(prev => {
        const updated = [newItem, ...prev];
        localStorage.setItem('campuscycle_items', JSON.stringify(updated));
        return updated;
      });

      alert("Item posted successfully!");
      navigate('/home');

    } catch (error) {
      console.error(error);
      alert(error.message);
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
            <input
              type="text"
              name="ItemName"
              className="input-field"
              value={formData.ItemName}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label style={styles.label}>Category</label>
            <select
              name="Category"
              className="input-field"
              value={formData.Category}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={styles.label}>Condition</label>
            <select
              name="Condition"
              className="input-field"
              value={formData.Condition}
              onChange={handleChange}
              required
            >
              <option value="">Select Condition</option>
              {CONDITIONS.map(cond => (
                <option key={cond} value={cond}>{cond}</option>
              ))}
            </select>
          </div>

          {suggestedPrice && !formData.FreecycleTag && (
            <div style={styles.aiBox}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} />
                <strong>AI Suggested Price</strong>
              </div>
              <p>Based on similar items: {suggestedPrice}</p>
            </div>
          )}

          <div>
            <label style={styles.label}>Price (₹)</label>
            <input
              type="number"
              name="Price"
              className="input-field"
              value={formData.Price}
              onChange={handleChange}
              required={!formData.FreecycleTag}
              disabled={formData.FreecycleTag}
            />
          </div>

          <label>
            <input
              type="checkbox"
              name="FreecycleTag"
              checked={formData.FreecycleTag}
              onChange={handleChange}
            />
            Mark as Free
          </label>

          <label>
            <input
              type="checkbox"
              name="LeavingCampusSoonTag"
              checked={formData.LeavingCampusSoonTag}
              onChange={handleChange}
            />
            Leaving Campus Soon
          </label>

          <div>
            <label style={styles.label}>Pickup Location</label>
            <select
              name="PickupLocation"
              className="input-field"
              value={formData.PickupLocation}
              onChange={handleChange}
              required
            >
              <option value="">Select Location</option>
              {BASIC_LOCATIONS.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {formData.PickupLocation === 'Department Blocks' && (
            <div>
              <label style={styles.label}>Department Block</label>
              <select
                name="DepartmentPickup"
                className="input-field"
                value={formData.DepartmentPickup}
                onChange={handleChange}
                required
              >
                <option value="">Select Department</option>
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label style={styles.label}>Description</label>
            <textarea
              name="Description"
              className="input-field"
              rows="4"
              value={formData.Description}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label style={styles.label}>Item Image</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                style={{ width: '120px', marginTop: '10px', borderRadius: '8px' }}
              />
            )}
          </div>

          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Posting..." : "Post Listing"}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  label: {
    fontWeight: '600',
    marginBottom: '5px',
    display: 'block'
  },
  aiBox: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    background: '#f9f9f9'
  }
};

export default PostItem;