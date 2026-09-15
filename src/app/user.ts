export interface User {
  _id?: string;
  id?: string;
  firstName: string;
  lastName: string;
  name?: string;
  email: string;
  role: 'user' | 'vendor' | 'admin';
  ownerStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  phone?: string;
  city?: string;
  imageUrl?: string;
  createdAt?: string;
}
