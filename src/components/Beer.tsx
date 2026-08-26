import { CategoryShelf } from "./CategoryShelf";
import type { CategoryProduct } from "./catalog";
export function Beer({ products }: { products: CategoryProduct[] }) { return <CategoryShelf title="Beer" products={products} />; }
