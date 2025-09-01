import { NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/api";
import { createAuthErrorResponse } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const qs = url.search ? url.search : "";
    const backend = `${API_BASE_URL}/activity${qs}`;
    const res = await fetch(backend, {
      headers: {
        Authorization: req.headers.get("authorization") || "",
      },
      next: { revalidate: 0 },
    });

    // Handle 401 authentication error
    if (res.status === 401) {
      return new Response(JSON.stringify(createAuthErrorResponse()), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), { status: res.status });
  } catch (error) {
    // Handle any other errors
    return new Response(JSON.stringify(createAuthErrorResponse()), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${API_BASE_URL}/activity`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.get("authorization") || "",
      },
      body: JSON.stringify(body),
    });

    // Handle 401 authentication error
    if (res.status === 401) {
      return new Response(JSON.stringify(createAuthErrorResponse()), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), { status: res.status });
  } catch (error) {
    // Handle any other errors
    return new Response(JSON.stringify(createAuthErrorResponse()), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
