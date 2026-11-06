import { db } from "@/db";
import { categories, medicines, users } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { count, eq } from "drizzle-orm";

let seedPromise: Promise<void> | null = null;
const shouldAutoSeed = process.env.NODE_ENV !== "production" || process.env.SEED_ON_BOOT === "true";

const MEDICINE_IMAGE_BY_NAME: Record<string, string> = {
  "Wellman / Multivitamin + Zinc Daily Pack": "https://thehealthpharmacy.co.uk/wp-content/uploads/2025/09/wellmanmax-2.webp",
  "WHO Formula ORS Rehydration Sachets (Box of 10)": "http://janswasthyavitran.website/cdn/shop/files/71lLXSonqyL._AC_UF1000_1000_QL80.jpg?crop=center&height=1200&v=1744394493&width=1200",
  "Procold Cold & Flu Relief Tablets": "http://mysasun.com/cdn/shop/files/ChatGPTImageApr21_2026_03_04_42PM.png?v=1776801966",
  "Gestid Antacid Suspension 200ml": "https://hollyswellness.com/wp-content/uploads/2026/02/IMG_0687.png",
  "Funbact-A Triple Action Skin Cream 30g": "http://afrobuy.co.uk/cdn/shop/products/funbact-a-beauty-health-545_400x_42733f5e-deb6-47f1-a5ed-f0c2f16a1325_800x.webp?v=1756997574",
  "Fidson Ibuprofen Caplets 400mg": "https://cdn.sanity.io/images/zbeduy22/production/f2320d562bf550e3bc3a1cf78b85954f8d9a8f6e-600x600.jpg",
  "Emzor Paracetamol Tablets (Pack of 96)": "https://image.thum.io/get/width/1200/https://www.emzorpharma.com/upcp_product/emzor-paracetamol-500mg-tablets-96/",
  "Em-Vit-C Chewable 1000mg Tablets": "https://image.thum.io/get/width/1200/https://www.emzorpharma.com/upcp_product/em-vit-c-100mg-tabs-chewable-1000/",
  "Dettol Antiseptic Disinfectant Liquid 250ml": "https://surgicaldirect.com.au/wp-content/uploads/2024/06/DETTOL-Antiseptic-Disinfectant-Liquid-250ml.jpg",
  "Benylin with Codeine Free Cough Syrup 100ml": "https://zimetro.co.zw/wp-content/uploads/2024/04/Benylin-with-codeine.jpg",
  "Augmentin 625mg Film-Coated Tablets": "https://cdn11.bigcommerce.com/s-dmb1ykvg7m/products/31196/images/14834/AUGMENTIN_625MG_TAB__29542.1721014607.386.513.jpg?c=2",
  "Amoxil Capsules 500mg": "https://www.memontraders.com/wp-content/uploads/2022/06/Amoxil-Amoxycillin-500mg.jpg",
};

function imageForName(name: string) {
  return MEDICINE_IMAGE_BY_NAME[name] ?? "/images/pharmacy-hero.png";
}

export async function ensureSeeded() {
  if (!shouldAutoSeed) return;
  if (seedPromise) return seedPromise;

  seedPromise = (async () => {
    try {
      const existingAdmin = await db.query.users.findFirst({ where: eq(users.email, "admin@naijacare.com") });
      if (!existingAdmin) {
        const adminPassword = await hashPassword("Admin123!");
        await db.insert(users).values({
          fullName: "Pharm. Adaeze Nwosu (Admin)",
          email: "admin@naijacare.com",
          passwordHash: adminPassword,
          phoneNumber: "+2348031112222",
          address: "12 Marina Road, Victoria Island, Lagos",
          role: "admin",
        });
      }

      const existingCustomer = await db.query.users.findFirst({ where: eq(users.email, "customer@naijacare.com") });
      if (!existingCustomer) {
        const customerPassword = await hashPassword("Customer123!");
        await db.insert(users).values({
          fullName: "Chinedu Okafor",
          email: "customer@naijacare.com",
          passwordHash: customerPassword,
          phoneNumber: "+2348093334444",
          address: "24 Wuse Zone 2, Abuja FCT",
          role: "customer",
        });
      }

      const catCountRes = await db.select({ c: count() }).from(categories);
      let categoryRows = await db.select().from(categories);

      if ((catCountRes[0]?.c ?? 0) === 0) {
        categoryRows = await db
          .insert(categories)
          .values([
            { name: "Pain Relief", description: "Analgesics and fever reducers for headaches, body pain, and inflammation.", isActive: true },
            { name: "Antibiotics", description: "NAFDAC-verified antibacterial medications for infections.", isActive: true },
            { name: "Vitamins", description: "Daily immune boosters, multivitamins, and mineral supplements.", isActive: true },
            { name: "Cold & Flu", description: "Fast relief for cough, catarrh, nasal congestion, and sore throat.", isActive: true },
            { name: "Digestive Health", description: "Antacids, oral rehydration salts (ORS), and gut care essentials.", isActive: true },
            { name: "First Aid", description: "Antiseptics, wound dressings, bandages, and emergency care supplies.", isActive: true },
            { name: "Personal Care", description: "Everyday hygiene, dermatological creams, and wellness care.", isActive: true },
          ])
          .returning();
      }

      const medCountRes = await db.select({ c: count() }).from(medicines);
      const byName = (name: string) => categoryRows.find((c) => c.name === name)?.id ?? null;

      if ((medCountRes[0]?.c ?? 0) === 0) {
        await db.insert(medicines).values([
          {
            name: "Emzor Paracetamol Tablets (Pack of 96)",
            genericName: "Acetaminophen 500mg",
            description: "Trusted Nigerian analgesic and antipyretic for effective relief of headache, feverish conditions, and mild-to-moderate body pain.",
            categoryId: byName("Pain Relief"),
            price: "1500.00",
            quantityInStock: 120,
            dosage: "1–2 tablets every 4–6 hours (max 8/day)",
            manufacturer: "Emzor Pharmaceutical Industries, Lagos",
            image: imageForName("Emzor Paracetamol Tablets (Pack of 96)"),
            expiryDate: new Date("2028-01-15"),
            requiresPrescription: false,
            isAvailable: true,
          },
          {
            name: "Procold Cold & Flu Relief Tablets",
            genericName: "Paracetamol + Phenylephrine + Chlorpheniramine",
            description: "Multi-symptom cold and flu relief.",
            categoryId: byName("Cold & Flu"),
            price: "1800.00",
            quantityInStock: 110,
            dosage: "1 tablet 3 times daily",
            manufacturer: "Orange Drugs Nigeria",
            image: imageForName("Procold Cold & Flu Relief Tablets"),
            expiryDate: new Date("2027-12-01"),
            requiresPrescription: false,
            isAvailable: true,
          },
        ]);
      }
    } finally {
      // no-op; the seed is intentionally guarded to avoid repeated updates on every public request
    }
  })();

  return seedPromise;
}
