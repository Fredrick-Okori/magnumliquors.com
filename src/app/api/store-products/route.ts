import { NextResponse } from "next/server";
import {
  getProductsFromSupabase,
  createProductInSupabase,
  updateProductInSupabase,
  deleteProductFromSupabase,
  parsePriceUgx,
  parseVolumeMl,
  parseAbvNumeric,
  SupabaseProductRow,
} from "@/lib/supabase";
import { Product, products as fallbackCatalog } from "@/data/products";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabaseProducts = await getProductsFromSupabase();
    const mappedList: Product[] = [];

    if (supabaseProducts && supabaseProducts.length > 0) {
      supabaseProducts.forEach((sp) => {
        const rawPriceUGX = Number(sp.price || 0);
        const numericUSD = Number((rawPriceUGX > 0 ? rawPriceUGX / 3700 : 94.59).toFixed(2));
        const stock = Number(sp.quantity_in_stock ?? 50);

        mappedList.push({
          id: String(sp.id),
          name: sp.name || "Untitled Spirit",
          producer: sp.brand || "Magnum Reserve",
          origin: sp.country_of_origin || "Kampala, Uganda",
          category: sp.category || "Whiskey",
          price: `UGX ${rawPriceUGX.toLocaleString()}`,
          numericPrice: numericUSD,
          abv: sp.abv ? `${sp.abv}% ABV` : "40.0% ABV",
          volume: sp.volume_ml ? `${sp.volume_ml} ml` : "750 ml",
          vintage: sp.vintage ? String(sp.vintage) : undefined,
          rating: "Reserve Selection",
          description: sp.description || "",
          tastingNotes: {
            nose: "Rich oak and honey",
            palate: "Velvety spice and vanilla",
            finish: "Smooth warming finish",
            pairing: "Sip neat or on the rocks",
          },
          image: sp.image_url || "/products/premium-liquor-don-julio-70-uganda.jpg",
          inStock: stock > 0 && sp.is_active !== false,
          stockQuantity: stock,
        });
      });
    }

    // Merge with fallback catalog so all categories are fully stocked
    const existingNames = new Set(mappedList.map((p) => p.name.toLowerCase()));
    const finalProducts = [
      ...mappedList,
      ...fallbackCatalog.filter((fp) => !existingNames.has(fp.name.toLowerCase())),
    ];

    return NextResponse.json(finalProducts, {
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=59",
      },
    });
  } catch (error) {
    console.error("GET store-products error:", error);
    return NextResponse.json(fallbackCatalog, {
      headers: {
        "Cache-Control": "public, s-maxage=10, stale-while-revalidate=59",
      },
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const priceUGX = parsePriceUgx(body.priceUGX, body.numericPrice);
    const volumeMl = parseVolumeMl(body.volume);
    const abvNum = parseAbvNumeric(body.abv);
    const stockCount = Number(body.stockQuantity ?? 50);
    const numericUSD = Number((priceUGX / 3700).toFixed(2));

    const productRow: SupabaseProductRow = {
      name: body.name || "Untitled Spirit",
      brand: body.producer || body.brand || "Magnum Reserve",
      category: body.category || "Whiskey",
      subcategory: body.subcategory || null,
      country_of_origin: body.origin || body.country_of_origin || "Kampala, Uganda",
      price: priceUGX,
      volume_ml: volumeMl,
      abv: abvNum,
      quantity_in_stock: stockCount,
      pack_size: body.pack_size || "single",
      description: body.description || "",
      is_premium: true,
      is_active: true,
      image_url: body.image || body.image_url || "/products/premium-liquor-don-julio-70-uganda.jpg",
      vintage: body.vintage && !isNaN(parseInt(String(body.vintage), 10)) ? parseInt(String(body.vintage), 10) : null,
    };

    // Save directly to Supabase Database
    const { data: savedData, error: dbError } = await createProductInSupabase(productRow);

    if (dbError || !savedData) {
      console.error("Supabase Product Insertion Failed:", dbError);
      return NextResponse.json({ error: dbError || "Failed to write product to Supabase" }, { status: 400 });
    }

    const createdProduct: Product = {
      id: String(savedData.id),
      name: savedData.name,
      producer: savedData.brand || "Magnum Reserve",
      origin: savedData.country_of_origin || "Kampala, Uganda",
      category: savedData.category || "Whiskey",
      price: `UGX ${Number(savedData.price).toLocaleString()}`,
      numericPrice: numericUSD,
      abv: `${savedData.abv}% ABV`,
      volume: `${savedData.volume_ml} ml`,
      vintage: savedData.vintage ? String(savedData.vintage) : undefined,
      rating: "98 Pts • Reserve Selection",
      description: savedData.description || "",
      image: savedData.image_url,
      inStock: (savedData.quantity_in_stock ?? 0) > 0,
      stockQuantity: savedData.quantity_in_stock ?? stockCount,
      tastingNotes: {
        nose: body.nose || "Rich oak and honey",
        palate: body.palate || "Velvety spice and vanilla",
        finish: body.finish || "Smooth warming finish",
        pairing: body.pairing || "Sip neat or on the rocks",
      },
    };

    return NextResponse.json({ success: true, product: createdProduct });
  } catch (error: any) {
    console.error("POST store-products Supabase error:", error);
    return NextResponse.json({ error: error?.message || "Failed to create product in Supabase" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Product id is required" }, { status: 400 });
    }

    const body = await request.json();
    const updatePayload: Partial<SupabaseProductRow> = {};

    if (body.name !== undefined) updatePayload.name = body.name;
    if (body.producer !== undefined || body.brand !== undefined) {
      updatePayload.brand = body.producer || body.brand;
    }
    if (body.origin !== undefined || body.country_of_origin !== undefined) {
      updatePayload.country_of_origin = body.origin || body.country_of_origin;
    }
    if (body.category !== undefined) updatePayload.category = body.category;
    if (body.subcategory !== undefined) updatePayload.subcategory = body.subcategory;
    if (body.priceUGX !== undefined || body.price !== undefined || body.numericPrice !== undefined) {
      updatePayload.price = parsePriceUgx(body.priceUGX ?? body.price, body.numericPrice);
    }
    if (body.volume !== undefined || body.volume_ml !== undefined) {
      updatePayload.volume_ml = parseVolumeMl(body.volume ?? body.volume_ml);
    }
    if (body.abv !== undefined) {
      updatePayload.abv = parseAbvNumeric(body.abv);
    }
    if (body.description !== undefined) updatePayload.description = body.description;
    if (body.image !== undefined || body.image_url !== undefined) {
      updatePayload.image_url = body.image || body.image_url;
    }
    if (body.stockQuantity !== undefined || body.quantity_in_stock !== undefined) {
      const stock = Number(body.stockQuantity ?? body.quantity_in_stock);
      updatePayload.quantity_in_stock = stock;
      updatePayload.is_active = stock > 0;
    }

    const updated = await updateProductInSupabase(id, updatePayload);

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error("PATCH store-products Supabase error:", error);
    return NextResponse.json({ error: "Failed to update product in Supabase" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Product id is required" }, { status: 400 });
    }

    const success = await deleteProductFromSupabase(id);
    return NextResponse.json({ success });
  } catch (error) {
    console.error("DELETE store-products Supabase error:", error);
    return NextResponse.json({ error: "Failed to delete product from Supabase" }, { status: 500 });
  }
}
