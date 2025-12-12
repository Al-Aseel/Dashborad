import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        new URL("/reset-password?error=missing_token", request.url)
      );
    }

    // Redirect to the reset-password page with the token
    return NextResponse.redirect(
      new URL(`/reset-password?token=${encodeURIComponent(token)}`, request.url)
    );
  } catch (error) {
    console.error("Error in reset-password API route:", error);
    return NextResponse.redirect(
      new URL("/reset-password?error=invalid_request", request.url)
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password, password_confirmation } = body;

    if (!token || !password || !password_confirmation) {
      return NextResponse.json(
        {
          status: "error",
          message: "جميع الحقول مطلوبة",
        },
        { status: 400 }
      );
    }

    if (password !== password_confirmation) {
      return NextResponse.json(
        {
          status: "error",
          message: "كلمة المرور وتأكيد كلمة المرور غير متطابقتين",
        },
        { status: 400 }
      );
    }

    // Call the external API to reset password
    const apiResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.elaseel.org/api/v1"}/user/reset-password?token=${encodeURIComponent(token)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
          password_confirmation,
        }),
      }
    );

    const responseData = await apiResponse.json();

    if (!apiResponse.ok) {
      return NextResponse.json(
        {
          status: "error",
          message: responseData.message || "حدث خطأ أثناء إعادة تعيين كلمة المرور",
        },
        { status: apiResponse.status }
      );
    }

    return NextResponse.json({
      status: "success",
      message: "تم إعادة تعيين كلمة المرور بنجاح",
    });
  } catch (error) {
    console.error("Error in reset-password POST:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "حدث خطأ في الخادم",
      },
      { status: 500 }
    );
  }
}
