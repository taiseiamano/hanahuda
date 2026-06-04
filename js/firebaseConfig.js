export const firebaseConfig = {
  apiKey: "AIzaSyDpSNu_A_71V5HsqWgygc8NWQcZjIvalVU",
  authDomain: "hanahuda-2a607.firebaseapp.com",
  databaseURL: "https://hanahuda-2a607-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "hanahuda-2a607",
  storageBucket: "hanahuda-2a607.firebasestorage.app",
  messagingSenderId: "773402860014",
  appId: "1:773402860014:web:032da3612270e4e8f556ff"
};

export function hasFirebaseConfig() {
  return Object.values(firebaseConfig).every(value => typeof value === 'string' && value.trim().length > 0);
}
