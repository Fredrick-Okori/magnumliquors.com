import { CategoryShelf } from "./CategoryShelf";
import type { CategoryProduct } from "./catalog";
export function Bourbon({ products }: { products: CategoryProduct[] }) { return <CategoryShelf title="Bourbon" products={products} />; }
