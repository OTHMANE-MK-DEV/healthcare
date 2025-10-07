import { io } from 'socket.io-client';

const socket = io('http://localhost:5001');

socket.on('connect', () => console.log('Connected:', socket.id));

socket.on('ecgUpdate', (data) => {
  console.log('ECG Data:', data);
});
