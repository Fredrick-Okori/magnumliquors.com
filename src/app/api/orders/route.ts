import { NextResponse } from "next/server";
import { getPayload } from "payload";
import configPromise from "@payload-config";
import { saveOrderToSupabase, supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Attempt Payload CMS Query
    const payload = await getPayload({ config: configPromise });
    const response = await payload.find({
      collection: "orders",
      limit: 100,
    });

    if (response.docs && response.docs.length > 0) {
      return NextResponse.json({ docs: response.docs });
    }
  } catch (error) {
    console.warn("Payload Orders query fallback:", error);
  }

  // 2. Fallback to Supabase Query
  try {
    const { data: supabaseOrders } = await supabase.from("orders").select("*");
    if (supabaseOrders && supabaseOrders.length > 0) {
      const mappedDocs = supabaseOrders.map((so: any) => ({
        id: so.id,
        orderNumber: so.order_number,
        customerName: so.customer_name,
        customerEmail: so.customer_email,
        customerPhone: so.customer_phone,
        deliveryAddress: so.delivery_address,
        orderStatus: so.order_status,
        paymentMethod: so.payment_method,
        paymentStatus: so.payment_status,
        totalAmountUSD: so.total_amount_usd,
        totalAmountUGX: so.total_amount_ugx,
        items: so.items || [],
        createdAt: so.created_at,
      }));
      return NextResponse.json({ docs: mappedDocs });
    }
  } catch (supabaseErr) {
    console.warn("Supabase orders query exception:", supabaseErr);
  }

  return NextResponse.json({ docs: [] });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Persist to Supabase Database
    await saveOrderToSupabase({
      order_number: body.orderNumber || `MAG-${Math.floor(10000 + Math.random() * 90000)}`,
      customer_name: body.customerName,
      customer_email: body.customerEmail,
      customer_phone: body.customerPhone,
      delivery_address: body.deliveryAddress,
      order_status: body.orderStatus || "Pending",
      payment_method: body.paymentMethod || "Cash on Delivery",
      payment_status: body.paymentStatus || "Pending",
      total_amount_usd: Number(body.totalAmountUSD || 0),
      total_amount_ugx: Number(body.totalAmountUGX || 0),
      items: body.items || [],
    });

    // 2. Persist to Payload CMS Database
    try {
      const payload = await getPayload({ config: configPromise });
      const createdOrder = await payload.create({
        collection: "orders",
        data: {
          orderNumber: body.orderNumber || `MAG-${Math.floor(10000 + Math.random() * 90000)}`,
          customerName: body.customerName,
          customerEmail: body.customerEmail,
          customerPhone: body.customerPhone,
          deliveryAddress: body.deliveryAddress,
          orderStatus: body.orderStatus || "Pending",
          paymentMethod: body.paymentMethod || "Cash on Delivery",
          paymentStatus: body.paymentStatus || "Pending",
          totalAmountUSD: Number(body.totalAmountUSD || 0),
          totalAmountUGX: Number(body.totalAmountUGX || 0),
          items: body.items || [],
        },
      });

      return NextResponse.json({ success: true, order: createdOrder });
    } catch (payloadErr) {
      console.warn("Payload order creation notice:", payloadErr);
      return NextResponse.json({ success: true, notice: "Saved to Supabase DB" });
    }
  } catch (error) {
    console.error("Order POST creation error:", error);
    return NextResponse.json({ error: "Failed to process order" }, { status: 500 });
  }
}

