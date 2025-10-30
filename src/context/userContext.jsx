
import { createContext, useEffect, useState } from "react";
import { getSocket, connectSocket } from "../webSocket/socket";

export const UserStatusContext = createContext();

export const UserStatusProvider = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    const token = localStorage.getItem("token");
    const socket = connectSocket(token);

    if (!socket) return;

    socket.on("userOnline", ({ userId }) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    });

    socket.on("userOffline", ({ userId }) => {
      setOnlineUsers((prev) => {
        const updated = new Set(prev);
        updated.delete(userId);
        return updated;
      });
    });

    return () => socket.disconnect();
  }, []);

  return (
    <UserStatusContext.Provider value={{ onlineUsers }}>
      {children}
    </UserStatusContext.Provider>
  );
};
