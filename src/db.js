import firebase from "firebase/app";
import "firebase/firestore";

// Setup Firebase
var config = {
  apiKey: "AIzaSyBza1OUlrynAcNqCrFlS2Z2e2nkRQI4y_k",
  authDomain: "effectiveness-tracker.firebaseapp.com",
  databaseURL: "https://effectiveness-tracker.firebaseio.com",
  projectId: "effectiveness-tracker",
  storageBucket: "effectiveness-tracker.appspot.com",
  messagingSenderId: "846170353962",
  appId: "1:846170353962:web:02646203b2be1ddd012e53"
};

// Get a Firestore instance
export const db = firebase.initializeApp(config).firestore();

// Export types that exists in Firestore
// This is not always necessary, but it's used in other examples
// const { Timestamp, Number, String, Array } = firebase.firestore;
// export { Timestamp, Number, String, Array };
