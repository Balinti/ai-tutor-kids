import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateKidToken } from "@/lib/auth/requireKidAccess";

const RequestSchema = z.object({
  childId: z.string().uuid(),
  pin: z.string().length(4),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { childId, pin } = RequestSchema.parse(body);

    const supabase = createAdminClient();

    // Get child with PIN hash
    const { data: child, error } = await supabase
      .from("children")
      .select("id, parent_id, kid_pin_hash")
      .eq("id", childId)
      .single();

    if (error || !child) {
      return NextResponse.json(
        { ok: false, error: "Child not found" },
        { status: 404 }
      );
    }

    if (!child.kid_pin_hash) {
      return NextResponse.json(
        { ok: false, error: "PIN not set for this child" },
        { status: 400 }
      );
    }

    // Verify PIN
    const isValid = await bcrypt.compare(pin, child.kid_pin_hash);

    if (!isValid) {
      return NextResponse.json(
        { ok: false, error: "Invalid PIN" },
        { status: 401 }
      );
    }

    // Generate kid token
    const kidToken = generateKidToken(child.id, child.parent_id);

    // Log the event
    await supabase.from("audit_events").insert({
      event_type: "kid_pin_login",
      payload: { childId },
    });

    const response = NextResponse.json({ ok: true, kidToken });

    // Set HTTP-only cookie
    response.cookies.set("kid_token", kidToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 8 * 60 * 60, // 8 hours
      path: "/",
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: "Invalid request data" },
        { status: 400 }
      );
    }

    console.error("Kid PIN auth error:", error);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
