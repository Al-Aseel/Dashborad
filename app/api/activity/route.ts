import { NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/api";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const qs = url.search ? url.search : "";
  const backend = `${API_BASE_URL}/activity${qs}`;
  const res = await fetch(backend, {
    headers: {
      Authorization: req.headers.get("authorization") || "",
    },
    next: { revalidate: 0 },
  });
  const data = await res.json();
  return new Response(JSON.stringify(data), { status: res.status });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${API_BASE_URL}/activity`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: req.headers.get("authorization") || "",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return new Response(JSON.stringify(data), { status: res.status });
}
