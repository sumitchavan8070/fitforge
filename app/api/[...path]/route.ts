import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const base = () => process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";

async function forward(req: NextRequest, path: string[]) {
  const token = (await cookies()).get("gym_token")?.value;
  const headers = new Headers();
  const incomingType = req.headers.get("content-type") || "";
  if (token) headers.set("authorization", `Bearer ${token}`);
  let body: BodyInit | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    if (incomingType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      if (file instanceof File) {
        const bytes = Buffer.from(await file.arrayBuffer());
        const isText = file.type.includes("csv") || file.name.endsWith(".csv") || file.type.startsWith("text/");
        body = JSON.stringify(
          isText
            ? { filename: file.name, text: bytes.toString("utf8") }
            : { name: file.name, type: file.type, base64: bytes.toString("base64") },
        );
        headers.set("content-type", "application/json");
      }
    } else {
      body = await req.text();
      if (incomingType) headers.set("content-type", incomingType);
    }
  }
  const response = await fetch(`${base()}/api/${path.join("/")}${req.nextUrl.search}`, { method: req.method, headers, body, cache: "no-store" });
  const payload = await response.arrayBuffer();
  const out = new NextResponse(payload, { status: response.status });
  const type = response.headers.get("content-type");
  const disposition = response.headers.get("content-disposition");
  if (type) out.headers.set("content-type", type);
  if (disposition) out.headers.set("content-disposition", disposition);
  return out;
}

type Context = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, context: Context) {
  return forward(req, (await context.params).path);
}

export async function POST(req: NextRequest, context: Context) {
  return forward(req, (await context.params).path);
}

export async function PUT(req: NextRequest, context: Context) {
  return forward(req, (await context.params).path);
}

export async function PATCH(req: NextRequest, context: Context) {
  return forward(req, (await context.params).path);
}

export async function DELETE(req: NextRequest, context: Context) {
  return forward(req, (await context.params).path);
}
