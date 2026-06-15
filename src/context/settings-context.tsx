/**
 * SettingsContext — Global site settings available throughout the app.
 * Fetches once at startup, applies Google Fonts dynamically.
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { settingsService, type SiteSettings } from '@/services/settingsService';

interface SettingsContextValue {
    settings: SiteSettings;
    loading: boolean;
    refresh: () => Promise<void>;
}

const THEME_COLOR_KEY = 'koffeekup_theme_color';

const DEFAULT: SiteSettings = {
    site_name: 'KoffeeKup',
    currency_symbol: '₹',
    theme_color: '#f59e0b',
    font_heading: 'Playfair Display',
    font_body: 'Poppins',
};

/** Read the last-known theme color from localStorage (set before API loads) */
function getStoredThemeColor(): string {
    try {
        return localStorage.getItem(THEME_COLOR_KEY) || DEFAULT.theme_color!;
    } catch {
        return DEFAULT.theme_color!;
    }
}

const SettingsContext = createContext<SettingsContextValue>({
    settings: DEFAULT,
    loading: true,
    refresh: async () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    // Seed state with the localStorage color so components never see a wrong value
    const [settings, setSettings] = useState<SiteSettings>({
        ...DEFAULT,
        theme_color: getStoredThemeColor(),
    });
    const [loading, setLoading]   = useState(true);

    const apply = (s: SiteSettings) => {
        // Apply Google Fonts dynamically
        const headingFont = s.font_heading || DEFAULT.font_heading!;
        const bodyFont    = s.font_body    || DEFAULT.font_body!;

        // Load fonts
        const families = [headingFont, bodyFont].filter((f, i, a) => f && a.indexOf(f) === i);
        families.forEach(fontName => {
            const id = 'gf-' + fontName.replace(/\s+/g, '-').toLowerCase();
            if (document.getElementById(id)) return;
            const link  = document.createElement('link');
            link.id     = id;
            link.rel    = 'stylesheet';
            link.href   = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@400;500;600;700;800&display=swap`;
            document.head.appendChild(link);
        });

        // Set CSS variables so components can use them
        document.documentElement.style.setProperty('--font-heading', `'${headingFont}', serif`);
        document.documentElement.style.setProperty('--font-body',    `'${bodyFont}', sans-serif`);

        // Apply CSS variable for theme color and persist it for next page load
        const themeColor = s.theme_color || DEFAULT.theme_color || '#f59e0b';
        document.documentElement.style.setProperty('--theme-color', themeColor);
        try { localStorage.setItem(THEME_COLOR_KEY, themeColor); } catch { /* ignore */ }

        // Update favicon
        if (s.favicon_url) {
            let fav = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
            if (!fav) {
                fav = document.createElement('link');
                fav.rel = 'icon';
                document.head.appendChild(fav);
            }
            fav.href = s.favicon_url.startsWith('/') && !s.favicon_url.startsWith('/api') ? `/api${s.favicon_url}` : s.favicon_url;
        }
    };

    // Apply the stored/default color immediately on mount — before API responds
    useEffect(() => {
        document.documentElement.style.setProperty('--theme-color', getStoredThemeColor());
    }, []);

    const load = async () => {
        try {
            const s = await settingsService.getAll();
            setSettings({ ...DEFAULT, ...s });
            apply({ ...DEFAULT, ...s });
        } catch {
            // fallback to defaults silently
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    return (
        <SettingsContext.Provider value={{ settings, loading, refresh: load }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    return useContext(SettingsContext);
}
