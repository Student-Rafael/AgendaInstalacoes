import { 
    EmailAuthProvider, 
    reauthenticateWithCredential, 
    updatePassword as firebaseUpdatePassword 
  } from 'firebase/auth';
  import { auth } from '../config/firebase';
  
  /**
   * Atualiza a senha do usuário atual
   * @param email Email do usuário
   * @param currentPassword Senha atual
   * @param newPassword Nova senha
   */
  export const updatePassword = async (
    email: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> => {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      // Reautenticar o usuário antes de alterar a senha
      const credential = EmailAuthProvider.credential(email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Atualizar a senha
      await firebaseUpdatePassword(user, newPassword);
      
      return;
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      throw error;
    }
  };
  