// ✅ src/context/UserStatusContext.jsx
import { createContext, useEffect, useState } from "react";
import { connectSocket, disconnectSocket } from "../webSocket/socket";

export const UserStatusContext = createContext();

export const UserStatusProvider = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId"); // ✅ add this if you store it after login
    const socket = connectSocket(token, userId);

    if (!socket) return;

    // ✅ Real-time user online updates
    socket.on("userOnline", ({ userId }) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    });

    // ✅ Real-time user offline updates
    socket.on("userOffline", ({ userId }) => {
      setOnlineUsers((prev) => {
        const updated = new Set(prev);
        updated.delete(userId);
        return updated;
      });
    });

    // ✅ Cleanup
    return () => {
      socket.off("userOnline");
      socket.off("userOffline");
      disconnectSocket();
    };
  }, []);

  return (
    <UserStatusContext.Provider value={{ onlineUsers }}>
      {children}
    </UserStatusContext.Provider>
  );
};
