import { NextResponse } from "next/server";
import {
  createProductInSupabase,
  updateProductInSupabase,
  deleteProductFromSupabase,
  parsePriceUgx,
  parseVolumeMl,
  parseAbvNumeric,
  SupabaseProductRow,
} from "@/lib/supabase";
import { Product, products as fallbackCatalog } from "@/data/products";
import { getStoreProductsCatalog, invalidateProductCache } from "@/lib/products";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const finalProducts = await getStoreProductsCatalog();

    return NextResponse.json(finalProducts, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("GET store-products error:", error);
    return NextResponse.json(fallbackCatalog, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const priceUGX = parsePriceUgx(body.priceUGX, body.numericPrice);
    const buyingPriceUGX = parsePriceUgx(body.buyingPriceUGX ?? body.buyingPrice, 0);
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
      buying_price: buyingPriceUGX,
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
      buyingPrice: Number(savedData.buying_price ?? buyingPriceUGX),
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

    invalidateProductCache();
    return NextResponse.json({ success: true, product: createdProduct });
  } catch (error: unknown) {
    console.error("POST store-products Supabase error:", error);
    const message = error instanceof Error ? error.message : "Failed to create product in Supabase";
    return NextResponse.json({ error: message }, { status: 500 });
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
    if (body.buyingPriceUGX !== undefined || body.buyingPrice !== undefined) {
      updatePayload.buying_price = parsePriceUgx(body.buyingPriceUGX ?? body.buyingPrice, 0);
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

    invalidateProductCache();
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
    if (success) invalidateProductCache();
    return NextResponse.json({ success });
  } catch (error) {
    console.error("DELETE store-products Supabase error:", error);
    return NextResponse.json({ error: "Failed to delete product from Supabase" }, { status: 500 });
  }
}
