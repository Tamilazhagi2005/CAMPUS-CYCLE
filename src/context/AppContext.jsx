import React, { createContext, useContext, useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore";
import { db } from "../firebase";

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

const normalizeUser = (user) => {
  if (!user) return null;
  return {
    ItemsReused: 0,
    PointsEarned: 0,
    ItemsSold: 0,
    SellerRating: 5.0,
    Name: "",
    Email: "",
    Department: "",
    GraduatingYear: "",
    ...user
  };
};

export const AppProvider = ({ children }) => {
  const [currentUser, _setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("campuscycle_user");
    const parsed = saved ? JSON.parse(saved) : null;
    return normalizeUser(parsed);
  });

  const setCurrentUser = (value) => {
    _setCurrentUser((prev) => {
      const next = typeof value === "function" ? value(prev) : value;
      return normalizeUser(next);
    });
  };

  const [items, setItems] = useState([]);

  const [chats, setChats] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(
        "campuscycle_user",
        JSON.stringify(currentUser)
      );
    } else {
      localStorage.removeItem("campuscycle_user");
    }
  }, [currentUser]);

  useEffect(() => {
    const q = query(
      collection(db, "Items"),
      orderBy("DatePosted", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const itemData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

        setItems(itemData);
      },
      (error) => {
        console.error("Item listener error:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(
      collection(db, "Chats"),
      orderBy("UpdatedAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const chatData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));

        setChats(chatData);
        setLoadingChats(false);
      },
      (error) => {
        console.error("Chat listener error:", error);
        setLoadingChats(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("campuscycle_user");
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        items,
        setItems,
        chats,
        setChats,
        loadingChats,
        logout
      }}
    >
      {children}
    </AppContext.Provider>
  );
};