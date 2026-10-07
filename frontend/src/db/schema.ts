import { pgTable, text, timestamp, uuid, numeric, integer, boolean, pgEnum, index } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["customer", "admin"]);
export const orderStatusEnum = pgEnum("order_status", [
  "Pending",
  "Confirmed",
  "Processing",
  "Ready for Delivery",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
]);
export const paymentStatusEnum = pgEnum("payment_status", ["Pending", "Paid", "Failed"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  phoneNumber: text("phone_number").notNull(),
  address: text("address").notNull(),
  role: userRoleEnum("role").notNull().default("customer"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const medicines = pgTable(
  "medicines",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    genericName: text("generic_name").notNull(),
    description: text("description").notNull(),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
    price: numeric("price", { precision: 12, scale: 2 }).notNull(),
    quantityInStock: integer("quantity_in_stock").notNull().default(0),
    dosage: text("dosage").notNull(),
    manufacturer: text("manufacturer").notNull(),
    image: text("image").notNull(),
    expiryDate: timestamp("expiry_date", { withTimezone: true }).notNull(),
    requiresPrescription: boolean("requires_prescription").notNull().default(false),
    isAvailable: boolean("is_available").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    medicineNameIdx: index("medicines_name_idx").on(t.name),
    medicineGenericNameIdx: index("medicines_generic_name_idx").on(t.genericName),
  }),
);

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  phoneNumber: text("phone_number").notNull(),
  orderStatus: orderStatusEnum("order_status").notNull().default("Pending"),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("Pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  medicineId: uuid("medicine_id")
    .notNull()
    .references(() => medicines.id, { onDelete: "restrict" }),
  medicineName: text("medicine_name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
});
