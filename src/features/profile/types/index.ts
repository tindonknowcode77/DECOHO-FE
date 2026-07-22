export type UserProfile = {
  name: string;
  email: string;
  phone: string;
  address: string;
  preferredStyle: string;
  favoriteMaterials: string[];
  avatar: string;
  joinedDate: string;
};

export type ProfileOption = {
  id: string;
  label: string;
  description?: string;
};
