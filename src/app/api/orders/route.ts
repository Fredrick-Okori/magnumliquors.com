import { NextResponse } from "next/server";
import { saveOrderToSupabase, supabase } from "@/lib/supabase";
import { getOrdersCatalog, invalidateOrdersCache } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const orders = await getOrdersCatalog();

    return NextResponse.json(
      { docs: orders },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("GET orders Supabase error:", error);
    return NextResponse.json({ docs: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const grossUSD = Number(body.totalAmountUSD || 0);
    const grossUGX = Number(body.totalAmountUGX || 0);
    const items = Array.isArray(body.items) ? body.items : [];
    const grossProfitUGX = items.reduce(
      (sum: number, item: { grossProfitUGX?: number }) => sum + Math.max(0, Number(item.grossProfitUGX || 0)),
      0
    );
    const commRate = 0.25;
    const sysCommUGX = Math.round(grossProfitUGX * commRate);
    const sysCommUSD = Number((sysCommUGX / 3700).toFixed(2));
    const netPayoutUGX = Math.max(0, grossProfitUGX - sysCommUGX);
    const netPayoutUSD = Number((netPayoutUGX / 3700).toFixed(2));

    const saved = await saveOrderToSupabase({
      order_number: body.orderNumber || `MAG-${Math.floor(10000 + Math.random() * 90000)}`,
      customer_name: body.customerName,
      customer_email: body.customerEmail,
      customer_phone: body.customerPhone,
      delivery_address: body.deliveryAddress,
      order_status: body.orderStatus || "Pending",
      payment_method: body.paymentMethod || "Cash on Delivery",
      payment_status: body.paymentStatus || "Pending",
      total_amount_usd: grossUSD,
      total_amount_ugx: grossUGX,
      commission_rate: commRate,
      gross_profit_ugx: grossProfitUGX,
      developer_profit_share_ugx: sysCommUGX,
      store_profit_ugx: netPayoutUGX,
      system_commission_usd: sysCommUSD,
      system_commission_ugx: sysCommUGX,
      net_payout_usd: netPayoutUSD,
      net_payout_ugx: netPayoutUGX,
      items,
    });

    if (saved.error) {
      console.warn("Order save notice:", saved.error);
      return NextResponse.json({ success: false, error: saved.error }, { status: 503 });
    }

    invalidateOrdersCache();
    return NextResponse.json({ success: true, order: saved.data });
  } catch (error: any) {
    console.error("Order POST creation error:", error);
    return NextResponse.json({ error: error?.message || "Failed to process order in Supabase" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const orderNumber = searchParams.get("orderNumber");
    const body = await request.json();

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.orderStatus !== undefined) updatePayload.order_status = body.orderStatus;
    if (body.paymentStatus !== undefined) updatePayload.payment_status = body.paymentStatus;
    if (body.deliveryAddress !== undefined) updatePayload.delivery_address = body.deliveryAddress;
    if (body.customerPhone !== undefined) updatePayload.customer_phone = body.customerPhone;

    let query = supabase.from("orders").update(updatePayload);
    if (id) {
      query = query.eq("id", id);
    } else if (orderNumber) {
      query = query.eq("order_number", orderNumber);
    } else {
      return NextResponse.json({ error: "Order id or orderNumber is required" }, { status: 400 });
    }

    const { data, error } = await query.select();
    if (error) {
      console.warn("Supabase order update notice:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    invalidateOrdersCache();
    return NextResponse.json({ success: true, order: data?.[0] });
  } catch (error) {
    console.error("PATCH order Supabase error:", error);
    return NextResponse.json({ error: "Failed to update order in Supabase" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Order id is required" }, { status: 400 });
    }

    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    invalidateOrdersCache();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE order error:", error);
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}
