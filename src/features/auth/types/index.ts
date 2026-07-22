export type LoginFormState = {
  email: string;
  password: string;
  remember: boolean;
};

export type RegisterFormState = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
};

export type AuthSessionUser = {
  address?: string;
  avatar?: string;
  email: string;
  favoriteMaterials?: string[];
  name: string;
  phone?: string;
  preferredStyle?: string;
  remember?: boolean;
  registeredAt?: string;
  role?: "admin" | "customer" | "store";
  storeId?: string;
  storeName?: string;
  storeStatus?: "approved" | "pending" | "rejected";
};
