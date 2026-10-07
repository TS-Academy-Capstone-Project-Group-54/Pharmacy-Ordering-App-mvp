export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
};

export type SessionPayload = {
  userId: string;
  email: string;
  role: "customer" | "admin";
  fullName: string;
};

export type CartItem = {
  medicineId: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  image: string;
  availableStock: number;
};
