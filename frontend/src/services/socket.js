import { io } from 'socket.io-client';

const getSocketUrl = () => {
  const hostname = window.location.hostname;
  return `http://${hostname}:5000`;
};

export const socket = io(getSocketUrl(), {
  autoConnect: true,
  withCredentials: true
});