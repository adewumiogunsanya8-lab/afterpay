"use client";

import { useRef, useState, type ChangeEvent } from "react";
import Image from "next/image";

type ImageUploadFieldProps = {
  label: string;
  name: string;
  scope: "products" | "categories";
  value: string;
  multiple?: boolean;
  maxImages?: number;
};

const fieldClassName =
  "block w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink-900 shadow-sm ring-1 ring-inset ring-ink-300 placeholder:text-ink-400 focus:ring-2 focus:ring-inset focus:ring-brand-600";

function parseUrls(value: string, allowComma: boolean): string[] {
  return value
    .split(allowComma ? /[\r\n,]+/ : /\r?\n/)
    .map((url) => url.trim())
    .filter(Boolean);
}

export function ImageUploadField({
  label,
  name,
  scope,
  value,
  multiple = false,
  maxImages = 8,
}: ImageUploadFieldProps) {
  const [urlText, setUrlText] = useState(value);
  const urls = parseUrls(urlText, multiple);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    if (!files.length) return;

    const room = Math.max(0, maxImages - urls.length);
    if (!room) {
      setMessage(`You can add up to ${maxImages} image${maxImages === 1 ? "" : "s"}.`);
      return;
    }

    setBusy(true);
    setMessage("");
    const uploaded: string[] = [];
    let failure = "";
    for (const file of files.slice(0, room)) {
      const body = new FormData();
      body.set("scope", scope);
      body.set("file", file);

      try {
        const response = await fetch("/api/admin/images", {
          method: "POST",
          body,
        });
        const result = (await response.json()) as { url?: string; error?: string };
        if (!response.ok || !result.url) {
          failure = result.error ?? `Could not upload ${file.name}.`;
          break;
        }
        uploaded.push(result.url);
      } catch {
        failure = `Could not upload ${file.name}. Check your connection and try again.`;
        break;
      }
    }

    if (uploaded.length) {
      setUrlText((current) =>
        (multiple ? [...parseUrls(current, multiple), ...uploaded] : uploaded.slice(0, 1)).join("\n"),
      );
    }
    setMessage(
      failure ||
        (files.length > room
          ? `Uploaded ${uploaded.length} image(s). The ${maxImages}-image limit was reached.`
          : `Uploaded ${uploaded.length} image(s).`),
    );
    setBusy(false);
  }

  function removeUrl(index: number) {
    setUrlText(urls.filter((_, currentIndex) => currentIndex !== index).join("\n"));
  }

  return (
    <div className="space-y-2 sm:col-span-2">
      <label htmlFor={name} className="block text-sm font-medium text-ink-700">{label}</label>
      <input type="hidden" name={name} value={urls.join("\n")} />
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple={multiple}
          onChange={uploadFiles}
          className="sr-only"
          aria-label={`Upload ${label.toLowerCase()}`}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50 disabled:opacity-60"
        >
          {busy ? "Uploading…" : urls.length && !multiple ? "Replace image" : "Upload image"}
        </button>
        <span className="text-xs text-ink-500">
          JPG, PNG, WebP, or AVIF. Up to 4 MB each{multiple ? `, ${maxImages} images total` : ""}.
        </span>
      </div>
      {message ? <p role="status" className="text-sm text-ink-600">{message}</p> : null}
      {urls.map((url, index) => (
        <div
          key={`${index}-${url}`}
          className="flex items-start gap-3 rounded-xl border border-line bg-white p-3"
        >
          <Image
            src={url}
            alt={`Uploaded image ${index + 1}`}
            width={64}
            height={64}
            unoptimized
            className="h-16 w-16 rounded-lg bg-surface object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="break-all text-xs text-ink-500">{url}</p>
            <button
              type="button"
              onClick={() => removeUrl(index)}
              className="mt-2 text-xs font-medium text-ember-700 hover:underline"
            >
              Remove image
            </button>
        </div>
        </div>
      ))}
      <textarea
        id={name}
        aria-label={`${label} URLs`}
        value={urlText}
        onChange={(event) => setUrlText(event.currentTarget.value)}
        placeholder={
          multiple
            ? "Paste image URLs, separated by commas or new lines"
            : "Paste an image URL or upload a file"
        }
        rows={Math.min(5, Math.max(2, urls.length))}
        className={fieldClassName}
      />
    </div>
  );
}
