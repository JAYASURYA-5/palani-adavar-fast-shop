// Firebase Configuration for Palani Andavar Fast Food
// Project Display Name: palani-andavar-db
// Project ID: task-flow-db-b8804 (from Firebase Console URL)

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDpRVZZM4V2PiWeyP6cqc2qJX6aY3ON7PU",
  authDomain: "task-flow-db-b8804.firebaseapp.com",
  projectId: "task-flow-db-b8804",
  storageBucket: "task-flow-db-b8804.firebasestorage.app",
  messagingSenderId: "439308400423",
  appId: "1:439308400423:web:e7cada9989ba04264d9b02"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore Database
export const db = getFirestore(app);

// Initialize Auth (for future use)
export const auth = getAuth(app);

export default app;
