// routes/StackParamList.ts
export type StackParamList = {
  Home: undefined;
  Login: undefined;
  InstallationDetails: { installationId: string };
  AddInstallation: { date: string };
  UserManagement: undefined;
  AddUser: undefined;
  EditUser: { userId: string };
  EditInstallation: { installationId: string };

};
