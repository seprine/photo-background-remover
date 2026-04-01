import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.REMOVE_BG_API_KEY;

  if (!apiKey || apiKey === "your_api_key_here") {
    return NextResponse.json(
      { error: "REMOVE_BG_API_KEY 未配置" },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json({ error: "未找到图片文件" }, { status: 400 });
    }

    const buffer = await imageFile.arrayBuffer();

    const removeBgFormData = new FormData();
    removeBgFormData.append("image_file", new Blob([buffer]), imageFile.name);
    removeBgFormData.append("size", "regular");
    removeBgFormData.append("format", "png");

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
      },
      body: removeBgFormData,
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "背景去除失败，请稍后重试" },
        { status: 500 }
      );
    }

    const resultBuffer = await response.arrayBuffer();

    return new NextResponse(resultBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("Route error:", err);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
