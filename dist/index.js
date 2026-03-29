// src/store/provider.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { useStore } from "zustand";

// src/store/citation-store.ts
import { createStore } from "zustand/vanilla";
function pushUnique(list, value) {
  return list.includes(value) ? list : [...list, value];
}
function createCitationStore(initial) {
  const initialEntries = initial?.entries ?? [];
  const initialEntriesById = Object.fromEntries(initialEntries.map((entry) => [entry.id, entry]));
  return createStore((set, get) => ({
    entriesById: initialEntriesById,
    style: initial?.style ?? "apa",
    locale: initial?.locale ?? "de-DE",
    markerStyle: initial?.markerStyle ?? "brackets",
    defaultInlineMode: initial?.defaultInlineMode ?? "parenthetical",
    bySlide: {},
    orderedUsedIds: [],
    initializeConfig(entries, style, locale, markerStyle, defaultInlineMode) {
      const entriesById = Object.fromEntries(entries.map((entry) => [entry.id, entry]));
      set({ entriesById, style, locale, markerStyle, defaultInlineMode });
    },
    registerCitation(slideId, citationId, variant) {
      set((state) => {
        const current = state.bySlide[slideId] ?? {
          usedIds: [],
          footnoteIds: []
        };
        const next = {
          usedIds: pushUnique(current.usedIds, citationId),
          footnoteIds: variant === "footnote" ? pushUnique(current.footnoteIds, citationId) : current.footnoteIds
        };
        const orderedUsedIds = pushUnique(state.orderedUsedIds, citationId);
        if (next.usedIds === current.usedIds && next.footnoteIds === current.footnoteIds && orderedUsedIds === state.orderedUsedIds) {
          return state;
        }
        return {
          ...state,
          orderedUsedIds,
          bySlide: {
            ...state.bySlide,
            [slideId]: next
          }
        };
      });
    },
    getAllUsedIds() {
      return get().orderedUsedIds;
    },
    getCitationNumber(citationId) {
      const index = get().orderedUsedIds.indexOf(citationId);
      return index >= 0 ? index + 1 : null;
    }
  }));
}

// src/store/provider.tsx
import { jsx } from "react/jsx-runtime";
var CitationStoreContext = createContext(null);
function CitationProvider({
  entries,
  style = "apa",
  locale = "de-DE",
  markerStyle = "brackets",
  defaultInlineMode = "parenthetical",
  children
}) {
  const [store] = useState(
    () => createCitationStore({ entries, style, locale, markerStyle, defaultInlineMode })
  );
  useEffect(() => {
    store.getState().initializeConfig(entries, style, locale, markerStyle, defaultInlineMode);
  }, [store, entries, style, locale, markerStyle, defaultInlineMode]);
  return /* @__PURE__ */ jsx(CitationStoreContext.Provider, { value: store, children });
}
function useCitationStore(selector) {
  const store = useContext(CitationStoreContext);
  if (!store) {
    throw new Error("useCitationStore must be used inside <CitationProvider>.");
  }
  return useStore(store, selector);
}
function useCitationStoreApi() {
  const store = useContext(CitationStoreContext);
  if (!store) {
    throw new Error("useCitationStoreApi must be used inside <CitationProvider>.");
  }
  return store;
}

// src/components/Cite.tsx
import { useEffect as useEffect3 } from "react";

// src/lib/format.ts
import React2 from "react";
import Cite from "citation-js";
function formatSingleNarrativeCitation(item, style, locale) {
  const cite = new Cite([item]);
  const authorOnly = String(
    cite.format("citation", {
      template: style,
      lang: locale,
      format: "text",
      entry: [{ id: item.id, "author-only": true }]
    })
  ).trim().replace(/[;,]\s*$/g, "");
  const suppressAuthor = String(
    cite.format("citation", {
      template: style,
      lang: locale,
      format: "text",
      entry: [{ id: item.id, "suppress-author": true }]
    })
  ).trim();
  return `${authorOnly} ${suppressAuthor}`.trim();
}
function formatInlineCitation(items, style, locale, mode = "parenthetical") {
  if (items.length === 0) return "";
  if (mode === "narrative") {
    return items.map((item) => formatSingleNarrativeCitation(item, style, locale)).join("; ");
  }
  const cite = new Cite(items);
  return String(
    cite.format("citation", {
      template: style,
      lang: locale,
      format: "text"
    })
  ).trim();
}
function formatFootnoteShortCitation(item, style, locale) {
  const inline = formatInlineCitation([item], style, locale, "narrative").trim();
  return inline.replace(/^\((.*)\)$/s, "$1").trim();
}
function formatBibliographyHtml(items, style, locale) {
  const cite = new Cite(items);
  return cite.format("bibliography", {
    template: style,
    lang: locale,
    format: "html"
  });
}
function formatCitationMarker(numbers, markerStyle = "brackets") {
  if (numbers.length === 0) {
    return markerStyle === "superscript" ? React2.createElement("sup", null, "?") : "[?]";
  }
  const text = numbers.join(", ");
  if (markerStyle === "superscript") {
    return React2.createElement("sup", null, text);
  }
  return `[${text}]`;
}

// src/lib/use-slide-id.ts
import { useEffect as useEffect2, useRef, useState as useState2 } from "react";

// src/lib/slide-id.ts
function generateFallbackId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `slide:${crypto.randomUUID()}`;
  }
  return `slide:${Math.random().toString(36).slice(2)}`;
}
function getOrCreateSlideId(node) {
  const section = node?.closest("section");
  if (!section) return null;
  if (section.id) {
    return `section:${section.id}`;
  }
  const existing = section.getAttribute("data-citation-slide-id");
  if (existing) return existing;
  const created = generateFallbackId();
  section.setAttribute("data-citation-slide-id", created);
  return created;
}

// src/lib/use-slide-id.ts
function useSlideId() {
  const ref = useRef(null);
  const [slideId, setSlideId] = useState2(null);
  useEffect2(() => {
    setSlideId(getOrCreateSlideId(ref.current));
  }, []);
  return { ref, slideId };
}

// src/components/Cite.tsx
import { jsxs } from "react/jsx-runtime";
function Cite2({
  id,
  inline = false,
  className,
  prefix = "",
  suffix = ""
}) {
  const { ref, slideId } = useSlideId();
  const store = useCitationStoreApi();
  const ids = Array.isArray(id) ? id : [id];
  const entriesById = useCitationStore((state) => state.entriesById);
  const style = useCitationStore((state) => state.style);
  const locale = useCitationStore((state) => state.locale);
  const markerStyle = useCitationStore((state) => state.markerStyle);
  const defaultInlineMode = useCitationStore((state) => state.defaultInlineMode);
  const orderedUsedIds = useCitationStore((state) => state.orderedUsedIds);
  const items = ids.map((citationId) => entriesById[citationId]).filter(Boolean);
  const missingIds = ids.filter((citationId) => !entriesById[citationId]);
  const citationNumbers = ids.map((citationId) => orderedUsedIds.indexOf(citationId) + 1).filter((number) => number > 0);
  const inlineMode = inline === false ? false : inline === true ? defaultInlineMode : inline;
  useEffect3(() => {
    if (!slideId) return;
    if (items.length === 0) return;
    const variant = inlineMode ? "inline" : "footnote";
    for (const citationId of ids) {
      if (entriesById[citationId]) {
        store.getState().registerCitation(slideId, citationId, variant);
      }
    }
  }, [slideId, ids, inlineMode, items.length, entriesById, store]);
  if (missingIds.length > 0) {
    return /* @__PURE__ */ jsxs("span", { ref, className, children: [
      "[missing citation: ",
      missingIds.join(", "),
      "]"
    ] });
  }
  const content = inlineMode ? formatInlineCitation(items, style, locale, inlineMode) : formatCitationMarker(citationNumbers, markerStyle);
  return /* @__PURE__ */ jsxs("span", { ref, className, children: [
    prefix,
    content,
    suffix
  ] });
}

// src/components/Bibliography.tsx
import { jsx as jsx2 } from "react/jsx-runtime";
function Bibliography({ ids, className, as: Component = "div" }) {
  const entriesById = useCitationStore((state) => state.entriesById);
  const orderedUsedIds = useCitationStore((state) => state.orderedUsedIds);
  const style = useCitationStore((state) => state.style);
  const locale = useCitationStore((state) => state.locale);
  const resolvedIds = ids ?? orderedUsedIds;
  const items = resolvedIds.map((id) => entriesById[id]).filter((item) => Boolean(item));
  if (items.length === 0) {
    return /* @__PURE__ */ jsx2(Component, { className });
  }
  const html = formatBibliographyHtml(items, style, locale);
  return /* @__PURE__ */ jsx2(Component, { className, dangerouslySetInnerHTML: { __html: html } });
}

// src/components/Sources.tsx
import React4 from "react";
import { Fragment, jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
function Sources({
  className,
  as: Component = "div",
  separator = " \xB7 ",
  showMarkers = true
}) {
  const { ref, slideId } = useSlideId();
  const slideState = useCitationStore((state) => slideId ? state.bySlide[slideId] : void 0);
  const footnoteIds = slideState?.footnoteIds ?? [];
  const entriesById = useCitationStore((state) => state.entriesById);
  const style = useCitationStore((state) => state.style);
  const locale = useCitationStore((state) => state.locale);
  const markerStyle = useCitationStore((state) => state.markerStyle);
  const orderedUsedIds = useCitationStore((state) => state.orderedUsedIds);
  const rendered = footnoteIds.reduce((acc, id) => {
    const item = entriesById[id];
    if (!item) return acc;
    const text = formatFootnoteShortCitation(item, style, locale);
    const markerNumber = orderedUsedIds.indexOf(id) + 1;
    const marker = markerNumber > 0 ? formatCitationMarker([markerNumber], markerStyle) : formatCitationMarker([], markerStyle);
    acc.push({
      id,
      content: showMarkers && markerNumber > 0 ? /* @__PURE__ */ jsxs2(Fragment, { children: [
        marker,
        " ",
        text
      ] }) : text
    });
    return acc;
  }, []);
  return /* @__PURE__ */ jsx3(Component, { ref, className, children: rendered.map(({ id, content }, index) => /* @__PURE__ */ jsxs2(React4.Fragment, { children: [
    index > 0 ? separator : null,
    /* @__PURE__ */ jsx3("span", { children: content })
  ] }, `${slideId ?? "slide"}:${index}:${id}`)) });
}
var FootnoteSources = Sources;
export {
  Bibliography,
  CitationProvider,
  Cite2 as Cite,
  FootnoteSources,
  Sources
};
//# sourceMappingURL=index.js.map