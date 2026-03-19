import React from 'react';
import { Languages, Loader2 } from 'lucide-react';

export type LanguageCode = 'da' | 'en' | 'de';

interface LanguageTabsProps {
    activeLang: LanguageCode;
    onLangChange: (lang: LanguageCode) => void;
    onAutoTranslate?: () => void;
    isTranslating?: boolean;
    showAutoTranslate?: boolean;
    forceOverwrite?: boolean;
    onOverwriteChange?: (overwrite: boolean) => void;
}

export const LanguageTabs: React.FC<LanguageTabsProps> = ({
    activeLang,
    onLangChange,
    onAutoTranslate,
    isTranslating = false,
    showAutoTranslate = false,
    forceOverwrite = false,
    onOverwriteChange
}) => {
    return (
        <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4 bg-gray-50 border border-gray-100 p-4 rounded-sm mb-6">
            <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="flex bg-gray-200/50 p-1 rounded-sm">
                    <button
                        type="button"
                        onClick={() => onLangChange('da')}
                        className={`px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all rounded-sm ${activeLang === 'da' ? 'bg-white shadow-sm text-[#CDA235]' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        DA
                    </button>
                    <button
                        type="button"
                        onClick={() => onLangChange('en')}
                        className={`px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all rounded-sm ${activeLang === 'en' ? 'bg-white shadow-sm text-[#CDA235]' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        EN
                    </button>
                    <button
                        type="button"
                        onClick={() => onLangChange('de')}
                        className={`px-6 py-2 text-xs font-bold uppercase tracking-widest transition-all rounded-sm ${activeLang === 'de' ? 'bg-white shadow-sm text-[#CDA235]' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        DE
                    </button>
                </div>
            </div>

            {showAutoTranslate && onAutoTranslate && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-200">
                    {onOverwriteChange && (
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={forceOverwrite}
                                onChange={(e) => onOverwriteChange(e.target.checked)}
                                className="w-4 h-4 accent-[#CDA235] cursor-pointer"
                            />
                            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 group-hover:text-gray-800 transition-colors">
                                Overwrite existing
                            </span>
                        </label>
                    )}
                    <button
                        type="button"
                        onClick={onAutoTranslate}
                        disabled={isTranslating}
                        className="w-full sm:w-auto text-[10px] bg-white border border-gray-200 px-5 py-2.5 font-bold uppercase tracking-widest text-[#CDA235] hover:border-[#CDA235] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        {isTranslating ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                Translating...
                            </>
                        ) : (
                            <>
                                <Languages size={14} />
                                Auto Translate
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};
