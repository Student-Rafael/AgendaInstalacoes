import { 
    collection, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    getDocs, 
    query, 
    where, 
    getDoc,
    Timestamp 
  } from 'firebase/firestore';
  import { db } from '../config/firebase';
  
  export type Installation = {
    id?: string;
    title: string;
    description: string;
    date: Date;
    address: string;
    client: string;
    phone: string;
    status: 'pending' | 'completed' | 'cancelled';
    createdBy: string;
    createdAt: Date;
  };

  type FirebaseInstallation = Omit<Installation, 'date' | 'createdAt'> & {
    date: Timestamp;
    createdAt: Timestamp;
  };
  
  export const addInstallation = async (installation: Omit<Installation, 'id' | 'createdAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'installations'), {
        ...installation,
        createdAt: Timestamp.now(),
        date: Timestamp.fromDate(installation.date)
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao adicionar instalação:', error);
      throw error;
    }
  };
  
  export const updateInstallation = async (id: string, data: Partial<FirebaseInstallation>) => {
    try {
      const installationRef = doc(db, 'installations', id);
      
      // Converter Date para Timestamp se existir
      const updateData = { ...data };
      if (updateData.date instanceof Date) {
        updateData.date = Timestamp.fromDate(updateData.date);
      }
      
      await updateDoc(installationRef, updateData);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar instalação:', error);
      throw error;
    }
  };
  
  export const deleteInstallation = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'installations', id));
      return true;
    } catch (error) {
      console.error('Erro ao excluir instalação:', error);
      throw error;
    }
  };
  
  export const getInstallationsByDate = async (date: Date) => {
    try {
      // Criar data de início (00:00:00) e fim (23:59:59) para o dia selecionado
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const q = query(
        collection(db, 'installations'),
        where('date', '>=', Timestamp.fromDate(startOfDay)),
        where('date', '<=', Timestamp.fromDate(endOfDay))
      );
      
      const querySnapshot = await getDocs(q);
      const installations: Installation[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirebaseInstallation;
        installations.push({
          id: doc.id,
          ...data,
          date: data.date instanceof Timestamp ? data.date.toDate() : data.date,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt
        } as Installation);
      });
      
      return installations;
    } catch (error) {
      console.error('Erro ao buscar instalações:', error);
      throw error;
    }
  };
  
  export const getAllInstallations = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'installations'));
      const installations: Installation[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as FirebaseInstallation;
        installations.push({
          id: doc.id,
          ...data,
          date: data.date instanceof Timestamp ? data.date.toDate() : data.date,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt
        } as Installation);
      });
      
      return installations;
    } catch (error) {
      console.error('Erro ao buscar todas as instalações:', error);
      throw error;
    }
  };
  
  export const getInstallationById = async (id: string) => {
    try {
      const docRef = doc(db, 'installations', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as FirebaseInstallation;
        return {
          id: docSnap.id,
          ...data,
          date: data.date instanceof Timestamp ? data.date.toDate() : data.date,
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt
        } as Installation;
      } else {
        throw new Error('Instalação não encontrada');
      }
    } catch (error) {
      console.error('Erro ao buscar instalação:', error);
      throw error;
    }
  };
  