import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.email(),
  password: z.string().min(6),
  phoneNumber: z.string().min(7),
  address: z.string().min(5),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const medicineSchema = z.object({
  name: z.string().min(2),
  genericName: z.string().min(2),
  description: z.string().min(10),
  categoryId: z.uuid().nullable().optional(),
  price: z.coerce.number().positive(),
  quantityInStock: z.coerce.number().int().min(0),
  dosage: z.string().min(2),
  manufacturer: z.string().min(2),
  image: z.string().min(1),
  expiryDate: z.coerce.date(),
  requiresPrescription: z.coerce.boolean().default(false),
  isAvailable: z.coerce.boolean().default(true),
});

export const categorySchema = z.object({
  name: z.string().min(2),
  description: z.string().min(3),
  isActive: z.coerce.boolean().default(true),
});

export const checkoutSchema = z.object({
  deliveryAddress: z.string().min(5),
  phoneNumber: z.string().min(7),
  paymentStatus: z.enum(["Pending", "Paid", "Failed"]).default("Pending"),
  items: z.array(
    z.object({
      medicineId: z.string().uuid(),
      quantity: z.number().int().min(1),
    }),
  ),
});

export const orderStatusSchema = z.object({
  orderStatus: z.enum([
    "Pending",
    "Confirmed",
    "Processing",
    "Ready for Delivery",
    "Out for Delivery",
    "Delivered",
    "Cancelled",
  ]),
});

export const profileSchema = z.object({
  fullName: z.string().min(2),
  phoneNumber: z.string().min(7),
  address: z.string().min(5),
});
