/**
 * useSeo — Injects dynamic meta tags into <head> for any page.
 * Usage: call useSeo({ pageType:'home' }) or useSeo({ pageType:'page', pageSlug:'about' })
 */
import { useEffect } from 'react';
import { seoService, type SeoRecord } from '@/services/seoService';

interface UseSeoOptions {
    pageType: 'home' | 'product' | 'category' | 'page';
    pageId?: number;
    pageSlug?: string;
    fallbackTitle?: string;
    fallbackDescription?: string;
}

function setMeta(name: string, content: string | null | undefined, property = false) {
    if (!content) return;
    const attr   = property ? 'property' : 'name';
    let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
    }
    el.content = content;
}

export function useSeo(options: UseSeoOptions) {
    const { pageType, pageId, pageSlug, fallbackTitle, fallbackDescription } = options;

    useEffect(() => {
        let cancelled = false;

        seoService.getForPage(pageType, pageId, pageSlug)
            .then((seo: SeoRecord | null) => {
                if (cancelled) return;

                const title = seo?.meta_title || fallbackTitle || document.title;
                const description = seo?.meta_description || fallbackDescription || '';
                const keywords    = seo?.meta_keywords || '';
                const ogImage     = seo?.og_image || '';

                document.title = title;
                setMeta('description', description);
                setMeta('keywords', keywords);
                setMeta('og:title', title, true);
                setMeta('og:description', description, true);
                if (ogImage) setMeta('og:image', ogImage, true);
                setMeta('twitter:title', title);
                setMeta('twitter:description', description);
            })
            .catch(() => {
                if (fallbackTitle) document.title = fallbackTitle;
            });

        return () => { cancelled = true; };
    }, [pageType, pageId, pageSlug, fallbackTitle, fallbackDescription]);
}
