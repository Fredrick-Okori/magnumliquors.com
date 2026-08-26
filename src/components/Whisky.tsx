import { CategoryShelf } from "./CategoryShelf";
import type { CategoryProduct } from "./catalog";
export function Whisky({ products }: { products: CategoryProduct[] }) { return <CategoryShelf title="Whisky" products={products} />; }
