import { 
    collection, 
    getDocs, 
    doc, 
    getDoc,
    setDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where 
  } from 'firebase/firestore';
  import { db, auth } from '../config/firebase';
  import { createUserWithEmailAndPassword } from 'firebase/auth';
  
  export type User = {
    id: string;
    name: string;
    email: string;
    isAdmin: boolean;
    createdAt: Date;
  };
  
  export const getAllUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const users: User[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          id: doc.id,
          name: data.name,
          email: data.email,
          isAdmin: data.isAdmin || false,
          createdAt: data.createdAt.toDate(),
        });
      });
      
      return users;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  };
  
  export const getUserById = async (id: string) => {
    try {
      const docRef = doc(db, 'users', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name,
          email: data.email,
          isAdmin: data.isAdmin || false,
          createdAt: data.createdAt.toDate(),
        };
      } else {
        throw new Error('Usuário não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      throw error;
    }
  };
  
  export const updateUser = async (id: string, data: Partial<User>) => {
    try {
      const userRef = doc(db, 'users', id);
      await updateDoc(userRef, data);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  };
  
  export const deleteUser = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'users', id));
      return true;
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      throw error;
    }
  };
  
  export const createUser = async (email: string, password: string, name: string, isAdmin: boolean = false) => {
    try {
      // Criar usuário no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { uid } = userCredential.user;
      
      // Salvar informações adicionais no Firestore
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, {
        name,
        email,
        isAdmin,
        createdAt: new Date()
      });
      
      return uid;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  };
  
  export const checkIfEmailExists = async (email: string) => {
    try {
      const q = query(collection(db, 'users'), where('email', '==', email));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      throw error;
    }
  };
  