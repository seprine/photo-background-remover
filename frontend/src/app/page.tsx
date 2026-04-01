"use client";

import { useState, useRef, useCallback } from "react";

type ProcessingState = "idle" | "processing" | "done" | "error";

export default function Home() {
  const [state, setState] = useState<ProcessingState>("idle");
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messages = [
    "正在识别主体...",
    "正在去除背景...",
    "正在生成透明图...",
    "快好了...",
  ];

  const processImage = async (file: File) => {
    setState("processing");
    setError(null);
    setResult(null);
    setPreview(URL.createObjectURL(file));

    let idx = 0;
    const interval = setInterval(() => {
      setLoadingMessage(messages[idx % messages.length]);
      idx++;
    }, 1500);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/remove-bg", {
        method: "POST",
        body: formData,
      });

      clearInterval(interval);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `处理失败 (${res.status})`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setResult(url);
      setState("done");
    } catch (e: unknown) {
      clearInterval(interval);
      const msg = e instanceof Error ? e.message : "未知错误";
      setError(msg);
      setState("error");
    }
  };

  const handleFile = useCallback((file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("仅支持 JPG / PNG / WebP 格式");
      setState("error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("图片大小不能超过 10MB");
      setState("error");
      return;
    }
    processImage(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleReset = () => {
    setState("idle");
    setPreview(null);
    setResult(null);
    setError(null);
    setLoadingMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🪄 图片背景去除
          </h1>
          <p className="text-gray-500 text-sm">
            5秒完成 · 无需注册 · 保护隐私
          </p>
        </div>

        {state === "idle" || state === "error" ? (
          <div
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-white hover:border-blue-400 hover:bg-gray-50"
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            <div className="text-5xl mb-4">📤</div>
            <p className="text-gray-700 font-medium mb-1">
              拖拽图片到这里，或点击选择文件
            </p>
            <p className="text-gray-400 text-sm">
              支持 JPG · PNG · WebP，不超过 10MB
            </p>
            {state === "error" && error && (
              <p className="mt-4 text-red-500 text-sm bg-red-50 rounded-lg px-4 py-2 inline-block">
                ⚠️ {error}
              </p>
            )}
          </div>
        ) : null}

        {state === "processing" && (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            {preview && (
              <div className="mb-6 flex justify-center">
                <img
                  src={preview}
                  alt="原图"
                  className="max-h-52 rounded-xl shadow-sm object-contain"
                />
              </div>
            )}
            <div className="text-5xl mb-4 animate-bounce">⚙️</div>
            <p className="text-gray-600 font-medium">{loadingMessage}</p>
          </div>
        )}

        {state === "done" && result && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs text-gray-400 mb-2 text-center">原图</p>
                <div className="relative rounded-xl overflow-hidden bg-checkerboard">
                  <img src={preview!} alt="原图" className="w-full object-contain" />
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-2 text-center">结果</p>
                <div className="relative rounded-xl overflow-hidden bg-checkerboard">
                  <img src={result} alt="结果" className="w-full object-contain" />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <a
                href={result}
                download="removed-bg.png"
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-center py-3 rounded-xl font-medium transition-colors"
              >
                ⬇️ 下载 PNG
              </a>
              <button
                onClick={handleReset}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-medium transition-colors"
              >
                🔄 重新上传
              </button>
            </div>
          </div>
        )}

        {state === "idle" && (
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            {[
              { icon: "⚡", label: "5秒完成" },
              { icon: "🔒", label: "不留痕迹" },
              { icon: "🆓", label: "完全免费" },
            ].map(({ icon, label }) => (
              <div
                key={label}
                className="bg-white rounded-xl py-3 text-sm text-gray-600 shadow-sm"
              >
                <span className="text-lg mr-1">{icon}</span>
                {label}
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">
          Powered by Remove.bg API · 图片仅在服务器内存中流转，不做任何持久化存储
        </p>
      </div>

      <style jsx global>{`
        .bg-checkerboard {
          background-image: linear-gradient(45deg, #e5e7eb 25%, transparent 25%),
            linear-gradient(-45deg, #e5e7eb 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #e5e7eb 75%),
            linear-gradient(-45deg, transparent 75%, #e5e7eb 75%);
          background-size: 16px 16px;
          background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
          min-height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </main>
  );
}
