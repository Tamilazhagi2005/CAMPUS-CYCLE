import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { CheckCircle2 } from 'lucide-react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

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

const GIRLS_HOSTEL_BLOCKS = [
  'Seeta A Block',
  'Seeta B Block',
  'Seeta C Block',
  'Vishalakshi Block',
  'Meenakshi Block'
];

const Signup = () => {
  const navigate = useNavigate();
  const { setUsers } = useAppContext();
  
  const [formData, setFormData] = useState({
    name: '',
    registerNumber: '',
    email: '',
    department: '',
    graduatingYear: '',
    commuteType: '', // Hosteller or Day Scholar
    hostelType: '', // Boys or Girls
    hostelBlock: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      let newData = { ...prev, [name]: value };
      
      // Dynamic clearing
      if (name === 'commuteType' && value === 'Day Scholar') {
        newData.hostelType = '';
        newData.hostelBlock = '';
      }
      if (name === 'hostelType' && value === 'Boys Hostel') {
        newData.hostelBlock = 'Boys Hostel';
      }
      if (name === 'hostelType' && value === 'Girls Hostel') {
        newData.hostelBlock = ''; 
      }
      
      return newData;
    });
    // Clear specific error on typing
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const validatePassword = (pwd) => {
    const minLen = pwd.length >= 8;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNum = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd);
    
    let errs = [];
    if (!minLen) errs.push("- Minimum 8 characters");
    if (!hasUpper) errs.push("- One uppercase letter");
    if (!hasLower) errs.push("- One lowercase letter");
    if (!hasNum) errs.push("- One number");
    if (!hasSpecial) errs.push("- One special character");
    
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};

    // Validate Email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@sonatech\.ac\.in$/i;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Only system-verified email addresses ending with @sonatech.ac.in are allowed.";
    }

    // Validate Password
    const pwdErrors = validatePassword(formData.password);
    if (pwdErrors.length > 0) {
      newErrors.password = "Password must contain:\n" + pwdErrors.join("\n");
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // 1. Create User in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 2. Automatic Graduation Status Logic
      const currentYear = new Date().getFullYear();
      const isGraduatingSoon = parseInt(formData.graduatingYear) === currentYear;

      // 3. Save User Data in Firestore
      const newUser = {
        UserID: user.uid, // Use Firebase UID
        Name: formData.name,
        RegisterNumber: formData.registerNumber,
        Department: formData.department,
        GraduatingYear: formData.graduatingYear,
        GraduatingSoonStatus: isGraduatingSoon,
        HostellerOrDayScholar: formData.commuteType,
        HostelType: formData.hostelType || '',
        HostelBlock: formData.hostelBlock || '',
        Email: formData.email,
        SellerRating: 5.0,
        VerifiedBadge: true, // Automatically verified by regex rules at Sona
        CreatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, "Users", user.uid), newUser);

      // We still update context locally for immediate reflection if needed,
      // but AppContext will ideally handle real-time sync with firebase in the future.
      setUsers(prev => [...prev, newUser]);
      
      alert("Signup successful! You've received the Verified Student Badge.");
      navigate('/login');

    } catch (error) {
      console.error("Signup error:", error);
      if (error.code === 'auth/email-already-in-use') {
        setErrors(prev => ({...prev, email: "This email is already registered."}));
      } else {
        alert("Failed to create account. Please try again later.");
      }
    }
  };

  return (
    <div className="page-container" style={{ paddingBottom: '20px' }}>
      <div className="glass-card" style={{ padding: '25px', maxWidth: '500px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '5px', textAlign: 'center' }}>Create Account</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '25px', fontSize: '0.9rem' }}>
          Join the Sona College Campus Marketplace
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div>
            <label style={styles.label}>Full Name</label>
            <input type="text" name="name" className="input-field" value={formData.name} onChange={handleChange} required />
          </div>

          <div>
            <label style={styles.label}>Register Number</label>
            <input type="text" name="registerNumber" className="input-field" value={formData.registerNumber} onChange={handleChange} required />
          </div>

          <div>
            <label style={styles.label}>College Email</label>
            <input type="email" name="email" className="input-field" placeholder="e.g. name.year@sonatech.ac.in" value={formData.email} onChange={handleChange} required />
            {errors.email && <div className="error-text">{errors.email}</div>}
          </div>

          <div>
            <label style={styles.label}>Department</label>
            <select name="department" className="input-field" value={formData.department} onChange={handleChange} required>
              <option value="">Select Department</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={styles.label}>Expected Graduating Year</label>
            <select name="graduatingYear" className="input-field" value={formData.graduatingYear} onChange={handleChange} required>
              <option value="">Select Year</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
              <option value="2028">2028</option>
              <option value="2029">2029</option>
              <option value="2030">2030</option>
            </select>
          </div>

          <div>
            <label style={styles.label}>Hosteller or Day Scholar</label>
            <select name="commuteType" className="input-field" value={formData.commuteType} onChange={handleChange} required>
              <option value="">Select Option</option>
              <option value="Hosteller">Hosteller</option>
              <option value="Day Scholar">Day Scholar</option>
            </select>
          </div>

          {formData.commuteType === 'Hosteller' && (
            <div style={{ padding: '15px', backgroundColor: 'rgba(47, 138, 74, 0.05)', borderRadius: 'var(--radius-md)'}}>
              <label style={styles.label}>Hostel Type</label>
              <select name="hostelType" className="input-field" value={formData.hostelType} onChange={handleChange} required>
                <option value="">Select Hostel</option>
                <option value="Boys Hostel">Boys Hostel</option>
                <option value="Girls Hostel">Girls Hostel</option>
              </select>

              {formData.hostelType === 'Girls Hostel' && (
                <div style={{ marginTop: '15px' }}>
                  <label style={styles.label}>Select Hostel Block</label>
                  <select name="hostelBlock" className="input-field" value={formData.hostelBlock} onChange={handleChange} required>
                    <option value="">Select Block</option>
                    {GIRLS_HOSTEL_BLOCKS.map(block => (
                      <option key={block} value={block}>{block}</option>
                    ))}
                  </select>
                </div>
              )}
              
              {formData.hostelType === 'Boys Hostel' && (
                <p style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Block automatically assigned to Boys Hostel.
                </p>
              )}
            </div>
          )}

          <div style={{ marginTop: '10px' }}>
            <label style={styles.label}>Password</label>
            <input type="password" name="password" className="input-field" value={formData.password} onChange={handleChange} required />
            {errors.password && <div className="error-text" style={{ whiteSpace: 'pre-line' }}>{errors.password}</div>}
          </div>

          <div>
            <label style={styles.label}>Confirm Password</label>
            <input type="password" name="confirmPassword" className="input-field" value={formData.confirmPassword} onChange={handleChange} required />
            {errors.confirmPassword && <div className="error-text">{errors.confirmPassword}</div>}
          </div>

          <div style={{ 
            marginTop: '10px', 
            padding: '10px', 
            border: '1px solid var(--border-color)', 
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            <CheckCircle2 color="var(--primary-color)" size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              By signing up with a verified Sona College email, you will automatically receive a <strong>Verified Student Badge</strong>.
            </p>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '15px' }}>
            Sign Up
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
          <Link to="/login" style={{ fontWeight: '600' }}>Login</Link>
        </div>
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
  }
};

export default Signup;
