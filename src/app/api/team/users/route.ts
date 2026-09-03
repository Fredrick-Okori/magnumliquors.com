import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ztjumhgtgnxfxtfwuzsn.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create admin client if service role key is present
const supabaseAdmin = serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

export type TeamRole = "Superadmin" | "Manager" | "Sales";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  phone: string;
  status: "Active On Shift" | "Active" | "Invited" | "Off Shift";
  authId?: string;
  createdAt?: string;
}

function normalizeRole(roleInput?: string): TeamRole {
  const r = (roleInput || "").toLowerCase();
  if (r.includes("super") || r.includes("admin")) return "Superadmin";
  if (r.includes("manage") || r.includes("sommelier") || r.includes("inventory")) return "Manager";
  return "Sales";
}

export async function GET() {
  try {
    const list: TeamMember[] = [];

    // 1. Try querying Supabase profiles table
    try {
      const { data: profiles, error: profErr } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (!profErr && profiles && profiles.length > 0) {
        profiles.forEach((p: any) => {
          const email = p.email || "staff@magnumliquors.com";
          if (!list.some((existing) => existing.email.toLowerCase() === email.toLowerCase())) {
            list.push({
              id: p.id || `usr_${Date.now()}`,
              authId: p.id,
              name: p.full_name || email.split("@")[0],
              role: normalizeRole(p.role),
              email: email,
              phone: p.phone || "+256 700 000000",
              status: "Active",
              createdAt: p.created_at,
            });
          }
        });
      }
    } catch {}

    // 2. If Supabase Admin is available, list users from Auth
    if (supabaseAdmin) {
      try {
        const { data: usersData, error } = await supabaseAdmin.auth.admin.listUsers();
        if (!error && usersData?.users) {
          usersData.users.forEach((u) => {
            const meta = u.user_metadata || {};
            const email = u.email || "user@magnumliquors.com";
            if (!list.some((existing) => existing.email.toLowerCase() === email.toLowerCase())) {
              list.push({
                id: u.id,
                authId: u.id,
                name: meta.full_name || meta.name || email.split("@")[0],
                role: normalizeRole(meta.role),
                email: email,
                phone: meta.phone || "+256 700 000000",
                status: u.email_confirmed_at ? "Active" : "Active",
                createdAt: u.created_at,
              });
            }
          });
        }
      } catch (err) {
        console.warn("Supabase admin listUsers warning:", err);
      }
    }

    return NextResponse.json(list);
  } catch (error) {
    console.error("GET /api/team/users error:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role, phone } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const assignedRole: TeamRole = normalizeRole(role);
    let authUserId = `usr_${Date.now()}`;
    let isConfirmed = false;

    // 1. Try Admin API if Service Key exists
    if (supabaseAdmin) {
      const { data: adminData, error: adminErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: name,
          role: assignedRole,
          phone: phone || "",
        },
      });

      if (adminErr) {
        return NextResponse.json({ error: adminErr.message }, { status: 400 });
      }

      if (adminData?.user) {
        authUserId = adminData.user.id;
        isConfirmed = true;
      }
    } else {
      // 2. Standard Supabase Auth Signup (Creates user directly in Supabase Authentication Users collection)
      const { data: signData, error: signErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: assignedRole,
            phone: phone || "",
          },
        },
      });

      if (signErr) {
        return NextResponse.json({ error: signErr.message }, { status: 400 });
      }

      if (signData?.user) {
        authUserId = signData.user.id;
        isConfirmed = !!signData.user.email_confirmed_at;
      }
    }

    // 3. Attempt inserting into public.profiles if the table exists
    try {
      await supabase.from("profiles").upsert({
        id: authUserId,
        email,
        full_name: name,
        role: assignedRole,
        phone: phone || "",
      });
    } catch {}

    const newMember: TeamMember = {
      id: authUserId,
      authId: authUserId,
      name: name || email.split("@")[0],
      email,
      role: assignedRole,
      phone: phone || "+256 700 000000",
      status: "Active",
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, member: newMember });
  } catch (error: any) {
    console.error("POST /api/team/users error:", error);
    return NextResponse.json({ error: error.message || "Failed to create user in Supabase." }, { status: 500 });
  }
}
