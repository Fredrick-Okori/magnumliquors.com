import { CategoryShelf } from "./CategoryShelf";
import type { CategoryProduct } from "./catalog";
export function Spirits({ products }: { products: CategoryProduct[] }) { return <CategoryShelf title="Spirits" products={products} />; }
