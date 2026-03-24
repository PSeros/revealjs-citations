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
    bySlide: {},
    orderedUsedIds: [],
    initializeConfig(entries, style, locale) {
      const entriesById = Object.fromEntries(entries.map((entry) => [entry.id, entry]));
      set({ entriesById, style, locale });
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
  children
}) {
  const [store] = useState(
    () => createCitationStore({ entries, style, locale })
  );
  useEffect(() => {
    store.getState().initializeConfig(entries, style, locale);
  }, [store, entries, style, locale]);
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
import Cite from "citation-js";
function formatInlineCitation(item, style, locale) {
  const cite = new Cite(item);
  return cite.format("citation", {
    template: style,
    lang: locale,
    format: "text"
  });
}
function formatFootnoteShortCitation(item, style, locale) {
  const inline = formatInlineCitation(item, style, locale).trim();
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
  const item = useCitationStore((state) => state.entriesById[id]);
  const style = useCitationStore((state) => state.style);
  const locale = useCitationStore((state) => state.locale);
  const citationNumber = useCitationStore((state) => state.orderedUsedIds.indexOf(id) + 1);
  useEffect3(() => {
    if (!slideId) return;
    if (!item) return;
    store.getState().registerCitation(slideId, id, inline ? "inline" : "footnote");
  }, [slideId, id, inline, item, store]);
  if (!item) {
    return /* @__PURE__ */ jsxs("span", { ref, className, children: [
      "[missing citation: ",
      id,
      "]"
    ] });
  }
  const content = inline ? formatInlineCitation(item, style, locale) : citationNumber > 0 ? `[${citationNumber}]` : "[?]";
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
import React3 from "react";
import { jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
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
  const orderedUsedIds = useCitationStore((state) => state.orderedUsedIds);
  const rendered = footnoteIds.map((id) => {
    const item = entriesById[id];
    if (!item) return null;
    const text = formatFootnoteShortCitation(item, style, locale);
    const markerNumber = orderedUsedIds.indexOf(id) + 1;
    return showMarkers && markerNumber > 0 ? `[${markerNumber}] ${text}` : text;
  }).filter((value) => Boolean(value));
  return /* @__PURE__ */ jsx3(Component, { ref, className, children: rendered.map((text, index) => /* @__PURE__ */ jsxs2(React3.Fragment, { children: [
    index > 0 ? separator : null,
    /* @__PURE__ */ jsx3("span", { children: text })
  ] }, `${slideId ?? "slide"}:${index}:${text.slice(0, 24)}`)) });
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