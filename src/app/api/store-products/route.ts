import { NextResponse } from "next/server";
import { getProductsFromPayload } from "@/lib/payload";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await getProductsFromPayload();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}

