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

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("campuscycle_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem("campuscycle_items");
    return saved ? JSON.parse(saved) : [];
  });

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
    localStorage.setItem(
      "campuscycle_items",
      JSON.stringify(items)
    );
  }, [items]);

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