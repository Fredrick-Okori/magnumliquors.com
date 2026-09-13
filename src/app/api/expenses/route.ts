import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getExpensesCatalog, invalidateExpensesCache } from "@/lib/expenses";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const expenses = await getExpensesCatalog();

    return NextResponse.json(
      { docs: expenses },
      {
        headers: {
          "Cache-Control": "private, max-age=15, s-maxage=15, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    console.error("GET expenses error:", error);
    return NextResponse.json({ docs: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const amountUGX = Number(body.amountUGX || 0);
    const amountUSD = Number((body.amountUSD ?? (amountUGX / 3700)).toFixed(2));

    const payload = {
      title: body.title,
      category: body.category || "Operations & Maintenance",
      amount_ugx: amountUGX,
      amount_usd: amountUSD,
      recorded_by: body.recordedBy || "Store Staff",
      payment_method: body.paymentMethod || "Cash",
      voucher_number: body.voucherNumber || `VCH-${Math.floor(1000 + Math.random() * 9000)}`,
      date: body.date || new Date().toISOString().slice(0, 10),
      status: body.status || "Approved",
      notes: body.notes || "",
    };

    const { data, error } = await supabase.from("expenses").insert([payload]).select();

    if (error) {
      console.warn("Supabase create expense notice:", error.message);
      return NextResponse.json({ success: false, error: "Unable to save expense" }, { status: 503 });
    }

    invalidateExpensesCache();
    return NextResponse.json({ success: true, expense: data?.[0] });
  } catch (error) {
    console.error("POST expense error:", error);
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Expense id is required" }, { status: 400 });
    }

    const body = await request.json();
    const updatePayload: Record<string, unknown> = {};

    if (body.status !== undefined) updatePayload.status = body.status;
    if (body.title !== undefined) updatePayload.title = body.title;
    if (body.amountUGX !== undefined) {
      updatePayload.amount_ugx = Number(body.amountUGX);
      updatePayload.amount_usd = Number((Number(body.amountUGX) / 3700).toFixed(2));
    }
    if (body.notes !== undefined) updatePayload.notes = body.notes;

    const { data, error } = await supabase.from("expenses").update(updatePayload).eq("id", id).select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    invalidateExpensesCache();
    return NextResponse.json({ success: true, expense: data?.[0] });
  } catch (error) {
    console.error("PATCH expense error:", error);
    return NextResponse.json({ error: "Failed to update expense" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Expense id is required" }, { status: 400 });
    }

    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    invalidateExpensesCache();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE expense error:", error);
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 });
  }
}
