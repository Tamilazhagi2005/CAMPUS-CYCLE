import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../firebase';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

const normalizeUser = (user) => {
  if (!user) return null;
  return {
    ItemsReused: 0,
    PointsEarned: 0,
    ItemsSold: 0,
    SellerRating: 5.0,
    Name: '',
    Email: '',
    Department: '',
    GraduatingYear: '',
    VerifiedCollegeEmail: false,
    ...user,
  };
};

export const AppProvider = ({ children }) => {
  const [currentUser, _setCurrentUser] = useState(null);
  const [authInitializing, setAuthInitializing] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  const setCurrentUser = (value) => {
    _setCurrentUser((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      return normalizeUser(next);
    });
  };

  const [items, setItems] = useState([]);
  const [chats, setChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);

  // Do not persist user in localStorage; rely on Firebase auth state and Firestore.

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          setCurrentUser(null);
          return;
        }

        const profileRef = doc(db, 'Users', user.uid);
        const profileSnap = await getDoc(profileRef);
        let profileData = profileSnap.exists() ? profileSnap.data() : null;

        if (user.emailVerified && profileData && !profileData.VerifiedCollegeEmail) {
          try {
            await updateDoc(profileRef, { VerifiedCollegeEmail: true });
            profileData = { ...profileData, VerifiedCollegeEmail: true };
          } catch (updateError) {
            console.warn('Failed to update user verification state:', updateError);
          }
        }

        setCurrentUser({
          UserID: user.uid,
          Email: user.email || '',
          Name: profileData?.Name || user.displayName || '',
          Department: profileData?.Department || '',
          GraduatingYear: profileData?.GraduatingYear || '',
          VerifiedCollegeEmail: Boolean(user.emailVerified),
          VerifiedBadge: profileData?.VerifiedBadge || false,
          SellerRating: profileData?.SellerRating || 5.0,
          ...profileData,
        });
      } catch (error) {
        console.error('Unable to sync authenticated user:', error);
        setCurrentUser(null);
      } finally {
        setAuthInitializing(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    // Listen only to Active items so sold items disappear immediately
    const q = query(
      collection(db, 'Items'),
      where('Status', '==', 'Active'),
      orderBy('DatePosted', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const itemData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setItems(itemData);
      },
      (error) => {
        console.error('Item listener error:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Persist theme globally and keep dark mode class on the body
    localStorage.setItem('theme', theme);

    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [theme]);

  useEffect(() => {
    // Set up per-user chat listeners to avoid sending all chats to client
    let unsubscribes = [];

    const setupListeners = (email) => {
      if (!email) return;

      const qBuyer = query(
        collection(db, 'Chats'),
        where('BuyerEmail', '==', email),
        orderBy('UpdatedAt', 'desc')
      );

      const qSeller = query(
        collection(db, 'Chats'),
        where('SellerEmail', '==', email),
        orderBy('UpdatedAt', 'desc')
      );

      const map = new Map();

      const pushSnapshot = (snapshot) => {
        snapshot.docs.forEach((d) => map.set(d.id, { id: d.id, ...d.data() }));
        const merged = Array.from(map.values()).sort((a, b) => {
          const at = a.UpdatedAt ? a.UpdatedAt.toMillis?.() || 0 : 0;
          const bt = b.UpdatedAt ? b.UpdatedAt.toMillis?.() || 0 : 0;
          return bt - at;
        });
        setChats(merged);
        setLoadingChats(false);
      };

      const unsub1 = onSnapshot(
        qBuyer,
        (snap) => pushSnapshot(snap),
        (err) => console.warn('Buyer chat listener error', err)
      );

      const unsub2 = onSnapshot(
        qSeller,
        (snap) => pushSnapshot(snap),
        (err) => console.warn('Seller chat listener error', err)
      );

      unsubscribes.push(unsub1, unsub2);
    };

    setupListeners(currentUser?.Email);

    return () => {
      unsubscribes.forEach((u) => u && u());
    };
  }, [currentUser?.Email]);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('Firebase sign out failed:', err);
    }
    setCurrentUser(null);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        authInitializing,
        items,
        setItems,
        chats,
        setChats,
        loadingChats,
        logout,
        theme,
        setTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};