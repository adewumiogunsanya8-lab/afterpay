"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { CloseIcon, SearchIcon } from "@/components/Icons";
import { SearchSuggestions } from "@/components/SearchSuggestions";
import type { Suggestion } from "@/lib/search";
import { cn } from "@/lib/cn";

/**
 * Search input with debounced autocomplete backed by `/api/search`.
 * Product records stay on the server; only suggestions are fetched.
 * Full keyboard support: arrows to move, Enter to open, Escape to dismiss.
 */
export function SearchBar({
  className,
  autoFocus = false,
  onSubmitted,
  placeholder = "Search products — try “laptop” or “sofa”",
}: {
  className?: string;
  autoFocus?: boolean;
  onSubmitted?: () => void;
  placeholder?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [categories, setCategories] = useState<{ slug: string; name: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const listboxId = useId();

  // Debounced autocomplete (180ms). The fetch only ever calls setState from the
  // timer callback, never synchronously inside the effect body.
  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(term)}`,
          { signal: controller.signal },
        );
        if (!response.ok) return;
        const data: {
          products: Suggestion[];
          categories: { slug: string; name: string }[];
        } = await response.json();
        setSuggestions(data.products);
        setCategories(data.categories);
        setOpen(true);
        setActiveIndex(-1);
      } catch {
        // Aborted or offline — keep whatever is already showing.
      }
    }, 180);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  // Derived: short queries never show stale suggestions.
  const hasQuery = query.trim().length >= 2;
  const visibleSuggestions = hasQuery ? suggestions : [];
  const visibleCategories = hasQuery ? categories : [];
  const optionCount = visibleSuggestions.length + visibleCategories.length;

  function submit(term: string) {
    const trimmed = term.trim();
    if (!trimmed) return;
    setOpen(false);
    onSubmitted?.();
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (optionCount === 0) return;
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) =>
        event.key === "ArrowDown"
          ? (index + 1) % optionCount
          : (index - 1 + optionCount) % optionCount,
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (activeIndex >= 0 && activeIndex < visibleSuggestions.length) {
        router.push(`/product/${visibleSuggestions[activeIndex].slug}`);
        setOpen(false);
        onSubmitted?.();
      } else if (activeIndex >= visibleSuggestions.length) {
        const category = visibleCategories[activeIndex - visibleSuggestions.length];
        if (category) {
          router.push(`/category/${category.slug}`);
          setOpen(false);
          onSubmitted?.();
        }
      } else {
        submit(query);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          submit(query);
        }}
        className="relative"
      >
        <label htmlFor={inputId} className="sr-only">
          Search products
        </label>
        <SearchIcon
          className="pointer-events-none absolute left-3.5 top-1/2 h-[1.1rem] w-[1.1rem] -translate-y-1/2 text-ink-400"
          aria-hidden="true"
        />
        <input
          id={inputId}
          type="search"
          role="combobox"
          aria-expanded={open && optionCount > 0}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
          autoComplete="off"
          autoFocus={autoFocus}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => optionCount > 0 && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="field h-11 w-full rounded-full border-ink-200 bg-white pl-11 pr-10 text-sm shadow-card"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSuggestions([]);
            }}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-400 transition hover:bg-ink-100 hover:text-ink-700"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        ) : null}
      </form>

      {open && optionCount > 0 ? (
        <SearchSuggestions
          listboxId={listboxId}
          suggestions={visibleSuggestions}
          categories={visibleCategories}
          activeIndex={activeIndex}
          onActivate={setActiveIndex}
          onDismiss={() => setOpen(false)}
          onNavigate={onSubmitted}
        />
      ) : null}
    </div>
  );
}
