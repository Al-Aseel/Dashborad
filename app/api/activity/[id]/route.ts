import { NextRequest } from "next/server";
import { API_BASE_URL } from "@/lib/api";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const res = await fetch(`${API_BASE_URL}/activity/${params.id}`, {
    headers: { Authorization: req.headers.get("authorization") || "" },
    next: { revalidate: 0 },
  });
  const data = await res.json();
  return new Response(JSON.stringify(data), { status: res.status });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const res = await fetch(`${API_BASE_URL}/activity/${params.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: req.headers.get("authorization") || "",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return new Response(JSON.stringify(data), { status: res.status });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const res = await fetch(`${API_BASE_URL}/activity/${params.id}`, {
    method: "DELETE",
    headers: { Authorization: req.headers.get("authorization") || "" },
  });
  const data = await res.json();
  return new Response(JSON.stringify(data), { status: res.status });
}
