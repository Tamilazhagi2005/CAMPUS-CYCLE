import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, orderBy, query, doc, getDoc } from 'firebase/firestore';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Users Database Mock
  const [users, setUsers] = useState([]);
  
  // Current logged in user
  const [currentUser, setCurrentUser] = useState(null);

  // Items Database Mock
  const [items, setItems] = useState([
    {
      ItemID: '1',
      ItemName: 'Scientific Calculator fx-991EX',
      Category: 'Lab Equipment',
      Condition: 'Good',
      Price: 200,
      Description: 'Barely used, working perfectly. Needed for engineering drawing and labs.',
      Image: 'https://images.unsplash.com/photo-1574526541604-58e5ff410d54?auto=format&fit=crop&q=80&w=300&h=300',
      SellerEmail: 'tamilazhagi.23ads@sonatech.ac.in',
      SellerName: 'Tamilazhagi',
      SellerDepartment: 'ADS',
      SellerRating: 4.8,
      VerifiedBadge: true,
      PickupLocation: 'Girls Hostel',
      DepartmentPickup: '',
      FreecycleTag: false,
      LeavingCampusSoonTag: true,
      DatePosted: new Date(Date.now() - 86400000).toISOString(),
      Status: 'Active'
    },
    {
      ItemID: '2',
      ItemName: 'Engineering Physics Book',
      Category: 'Books',
      Condition: 'Used',
      Price: 0,
      Description: 'Giving away my first-year physics textbook.',
      Image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=300&h=300',
      SellerEmail: 'arun.22cse@sonatech.ac.in',
      SellerName: 'Arun Kumar',
      SellerDepartment: 'CSE',
      SellerRating: 5.0,
      VerifiedBadge: true,
      PickupLocation: 'Library',
      DepartmentPickup: '',
      FreecycleTag: true,
      LeavingCampusSoonTag: false,
      DatePosted: new Date(Date.now() - 172800000).toISOString(),
      Status: 'Active'
    }
  ]);

  // Chats Database Mock
  const [chats, setChats] = useState([]);

  // Statistics Mock
  const [stats, setStats] = useState({
    ItemsReused: 124,
    MoneySaved: 52000,
    WastePrevented: 42 // in kg
  });

  // Firebase Real-time Sync
  useEffect(() => {
    // 1. Listen to Auth State
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "Users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setCurrentUser(userDocSnap.data());
        }
      } else {
        setCurrentUser(null);
      }
    });

    // 2. Listen to Items Collection
    const itemsQuery = query(collection(db, "Items"), orderBy("DatePosted", "desc"));
    const unsubscribeItems = onSnapshot(itemsQuery, (snapshot) => {
      const dbItems = snapshot.docs.map(doc => ({
        id: doc.id, // Keep doc id if needed later for updates/deletes
        ...doc.data()
      }));
      
      // If db has items, use them, otherwise keep the mock template showing
      if (dbItems.length > 0) {
         setItems(dbItems);
      }
    });

    // Cleanup listeners on unmount
    return () => {
      unsubscribeAuth();
      unsubscribeItems();
    };
  }, []);

  const value = {
    users,
    setUsers,
    currentUser,
    setCurrentUser,
    items,
    setItems,
    chats,
    setChats,
    stats,
    setStats
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
