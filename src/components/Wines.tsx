import { CategoryShelf } from "./CategoryShelf";
import type { CategoryProduct } from "./catalog";
export function Wines({ products }: { products: CategoryProduct[] }) { return <CategoryShelf title="Wine" products={products} />; }
