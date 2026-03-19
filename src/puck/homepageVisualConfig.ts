import React from 'react';
import type { Data } from '@measured/puck';
import { supabase } from '../../lib/supabase';
import { EMPTY_PUCK_DATA, normalizePuckData } from './puckData';
import { DEFAULT_HERO_SECTION_PROPS, normalizeHeroSectionProps, type HeroSectionProps } from './heroSection';

export type HomepageSectionType =
  | 'HeroSection'
  | 'PhilosophySection'
  | 'HistorySection'
  | 'MenuSection'
  | 'SeasonalSection'
  | 'EventsSection'
  | 'QuoteSection'
  | 'NewsSection'
  | 'BookingSection';

export interface HomepageSectionVisualProps {
  backgroundColor?: string;
  backgroundImage?: string;
  overlayColor?: string;
  textColor?: string;
  accentColor?: string;
  surfaceColor?: string;
  borderColor?: string;
  paddingTop?: number;
  paddingBottom?: number;
  maxWidth?: number;
  minHeight?: number;
}

export const HOMEPAGE_SECTION_TYPES: HomepageSectionType[] = [
  'HeroSection',
  'PhilosophySection',
  'HistorySection',
  'MenuSection',
  'SeasonalSection',
  'EventsSection',
  'QuoteSection',
  'NewsSection',
  'BookingSection',
];

export const DEFAULT_HOMEPAGE_PUCK_DATA: Data = {
  ...EMPTY_PUCK_DATA,
  content: HOMEPAGE_SECTION_TYPES.map((type) => ({
    type,
    props: type === 'HeroSection' ? DEFAULT_HERO_SECTION_PROPS : {},
  })),
};

export const ensureHomepagePuckData = (value: unknown): Data => {
  const normalized = normalizePuckData(value);
  const itemsByType = new Map(normalized.content.map((item) => [item.type, item]));

  return {
    ...normalized,
    content: HOMEPAGE_SECTION_TYPES.map((type) => {
      const existing = itemsByType.get(type);

      if (!existing) {
        return {
          type,
          props: type === 'HeroSection' ? DEFAULT_HERO_SECTION_PROPS : {},
        };
      }

      if (type === 'HeroSection') {
        return {
          ...existing,
          props: normalizeHeroSectionProps(existing.props),
        };
      }

      return existing;
    }),
  };
};

export const getSectionVisualProps = (
  data: Data | null | undefined,
  type: HomepageSectionType
): HomepageSectionVisualProps => {
  if (!data) {
    return {};
  }

  const item = data.content.find((entry) => entry.type === type);
  return (item?.props as HomepageSectionVisualProps | undefined) || {};
};

export const getHeroSectionContentProps = (data: Data | null | undefined): HeroSectionProps => {
  if (!data) {
    return DEFAULT_HERO_SECTION_PROPS;
  }

  const item = data.content.find((entry) => entry.type === 'HeroSection');
  return normalizeHeroSectionProps(item?.props);
};

export const toPx = (value?: number) => (typeof value === 'number' ? `${value}px` : undefined);

export const useHomepageVisualConfig = (): Data | null => {
  const [data, setData] = React.useState<Data | null>(null);

  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data: row } = await supabase
        .from('site_visual_config')
        .select('config')
        .eq('id', 'homepage')
        .maybeSingle();

      if (!mounted) {
        return;
      }

      setData(ensureHomepagePuckData(row?.config));
    };

    load().catch(() => {
      if (mounted) {
        setData(DEFAULT_HOMEPAGE_PUCK_DATA);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return data;
};
