import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Substitua com suas próprias configurações do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC1-XDFe0neGwZ25JYRS25L03vNt7Tc0HA",
  authDomain: "agenda-instalacoes.firebaseapp.com",
  projectId: "agenda-instalacoes",
  storageBucket: "agenda-instalacoes.firebasestorage.app",
  messagingSenderId: "36156023909",
  appId: "1:36156023909:web:2d58e1628ab14c8d7c128c"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar serviços do Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
