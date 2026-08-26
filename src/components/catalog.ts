export type Product = {
  name: string;
  producer: string;
  category: string;
  price: string;
  oldPrice?: string;
  badge?: string;
  image: string;
  tone: string;
};

export type CategoryProduct = Omit<Product, "category" | "tone"> & {
  category?: string;
  tone?: string;
};
