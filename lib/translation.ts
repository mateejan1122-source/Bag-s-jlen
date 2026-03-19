import { supabase } from './supabase';

export type LanguageCode = 'da' | 'en' | 'de';

export interface TranslateTarget {
    key: string;       // State key (e.g. 'footer_desc_en')
    lang: LanguageCode; // The language of this target
    currentText: string; // The current text in the field
}

export interface TranslationFieldConfig {
    sourceKey: string;      // Usually the current active lang key, e.g. 'footer_desc'
    sourceText: string;     // The actual text to translate
    targets: TranslateTarget[];
}

/**
 * Handles batch translating multiple text fields.
 * It will read the `deepl_api_key` from settings. If not available, it throws.
 *
 * @param apiKey - The DeepL API key (e.g. retrieved from settings)
 * @param sourceLang - The language we are translating FROM
 * @param fields - Array of fields to translate, with their respective source texts and targets
 * @param forceOverwrite - If false, it ignores targets that already have text
 * @returns A record mapping `{ [targetKey]: translatedText }` to merge into state
 */
export async function autoTranslateFields(
    apiKey: string,
    sourceLang: LanguageCode,
    fields: TranslationFieldConfig[],
    forceOverwrite: boolean = false
): Promise<Record<string, string>> {
    if (!apiKey) {
        throw new Error('DeepL API key not configured. Please add it under Settings → API Keys.');
    }

    const updates: Record<string, string> = {};
    let hasWork = false;

    // Filter out fields with no source text or empty targets (if not forcing overwrite)
    const workItems = fields.map(field => {
        if (!field.sourceText || !field.sourceText.trim()) return null;

        const targets = field.targets.filter(t => {
            // Never translate into the source language (safety net)
            if (t.lang === sourceLang) return false;
            // Skip if it has current text and we are NOT forcing overwrite
            if (!forceOverwrite && t.currentText && t.currentText.trim() !== '') return false;
            return true;
        });

        if (targets.length > 0) hasWork = true;
        return { ...field, targets };
    }).filter(Boolean) as TranslationFieldConfig[];

    if (!hasWork) {
        throw new Error(forceOverwrite
            ? 'No fields have content to translate from the current tab.'
            : 'All target fields already have content. Check "Overwrite existing" to force translation, or clear them first.'
        );
    }

    // Process translations
    for (const item of workItems) {
        for (const target of item.targets) {
            const deepLTarget = target.lang === 'en' ? 'EN-GB' : target.lang.toUpperCase();
            
            const { data, error } = await supabase.functions.invoke('translate', {
                body: {
                    text: [item.sourceText],
                    target_lang: deepLTarget,
                    // Pass the API key just in case the edge function supports dynamic keys
                    api_key: apiKey 
                }
            });

            if (error) {
                console.error('DeepL Translation API Error:', error);
                throw new Error(error.message || `API error: Failed to communicate with translation service.`);
            }

            if (data?.translations?.[0]?.text) {
                updates[target.key] = data.translations[0].text;
            } else {
                throw new Error('No translation returned from API.');
            }
        }
    }

    return updates;
}

/**
 * Utility to get the correct standard property key base on active language.
 * DA maps to `baseKey`. EN maps to `baseKey_en`. DE maps to `baseKey_de`.
 */
export function getLangKey(baseKey: string, lang: LanguageCode): string {
    if (lang === 'da') return baseKey;
    return `${baseKey}_${lang}`;
}
