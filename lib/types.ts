export type CategoryGroup = "bridal" | "neck" | "everyday" | "men";

export const GROUPS: { id: CategoryGroup; label: string; bn: string }[] = [
  { id: "bridal", label: "Bridal & ritual", bn: "বিয়ের গয়না" },
  { id: "neck", label: "Necklaces & pendants", bn: "গলার গয়না" },
  { id: "everyday", label: "Ears, fingers & wrists", bn: "রোজের গয়না" },
  { id: "men", label: "For him", bn: "ছেলেদের" },
];

export type Category = {
  id: number;
  slug: string;
  name: string;
  nameBn: string | null;
  group: CategoryGroup;
  description: string | null;
  image: string | null;
  sortOrder: number;
  isVisible: boolean;
  productCount: number;
};

export type Spec = { label: string; value: string };

export type Product = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  metal: "gold" | "silver";
  purity: string | null;
  weightGrams: number | null;
  weightNote: string | null;
  priceOverride: number | null;
  specs: Spec[];
  isFeatured: boolean;
  isPublished: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
  images: string[];
  categories: { slug: string; name: string; nameBn: string | null; group: CategoryGroup }[];
};

export type Settings = {
  goldRate22: number | null;
  goldRate18: number | null;
  silverRate: number | null;
  ratesUpdatedAt: Date | null;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  hours: string;
  mapUrl: string;
  facebook: string;
  instagram: string;
  youtube: string;
  logo: string;
};
