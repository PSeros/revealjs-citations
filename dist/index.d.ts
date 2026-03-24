import * as react_jsx_runtime from 'react/jsx-runtime';
import React from 'react';

type CitationVariant = 'inline' | 'footnote';
type CitationItem = {
    id: string;
    [key: string]: unknown;
};
type SlideCitationState = {
    usedIds: string[];
    footnoteIds: string[];
};

type CitationProviderProps = {
    entries: CitationItem[];
    style?: string;
    locale?: string;
    children?: React.ReactNode;
};
declare function CitationProvider({ entries, style, locale, children, }: CitationProviderProps): react_jsx_runtime.JSX.Element;

type CiteProps = {
    id: string;
    inline?: boolean;
    className?: string;
    prefix?: string;
    suffix?: string;
};
declare function Cite({ id, inline, className, prefix, suffix, }: CiteProps): react_jsx_runtime.JSX.Element;

type BibliographyProps = {
    ids?: string[];
    className?: string;
    as?: React.ElementType;
};
declare function Bibliography({ ids, className, as: Component }: BibliographyProps): react_jsx_runtime.JSX.Element;

type SourcesProps = {
    className?: string;
    as?: React.ElementType;
    separator?: React.ReactNode;
    showMarkers?: boolean;
};
declare function Sources({ className, as: Component, separator, showMarkers, }: SourcesProps): react_jsx_runtime.JSX.Element;
declare const FootnoteSources: typeof Sources;

export { Bibliography, type BibliographyProps, type CitationItem, CitationProvider, type CitationProviderProps, type CitationVariant, Cite, type CiteProps, FootnoteSources, type SlideCitationState, Sources, type SourcesProps };
