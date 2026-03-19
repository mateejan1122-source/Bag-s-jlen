import type { Config } from '@measured/puck';
import { BookingSectionBlock } from './blocks/BookingSectionBlock';
import { EventsSectionBlock } from './blocks/EventsSectionBlock';
import { HeroSectionBlock } from './blocks/HeroSectionBlock';
import { HistorySectionBlock } from './blocks/HistorySectionBlock';
import { MenuSectionBlock } from './blocks/MenuSectionBlock';
import { NewsSectionBlock } from './blocks/NewsSectionBlock';
import { PhilosophySectionBlock } from './blocks/PhilosophySectionBlock';
import { QuoteSectionBlock } from './blocks/QuoteSectionBlock';
import { SeasonalSectionBlock } from './blocks/SeasonalSectionBlock';

const visualFields = {
  backgroundColor: { type: 'text' as const, label: 'Background color' },
  backgroundImage: { type: 'text' as const, label: 'Background image URL' },
  overlayColor: { type: 'text' as const, label: 'Overlay color' },
  textColor: { type: 'text' as const, label: 'Text color' },
  accentColor: { type: 'text' as const, label: 'Accent color' },
  surfaceColor: { type: 'text' as const, label: 'Surface color' },
  borderColor: { type: 'text' as const, label: 'Border color' },
  paddingTop: { type: 'number' as const, label: 'Padding top' },
  paddingBottom: { type: 'number' as const, label: 'Padding bottom' },
  maxWidth: { type: 'number' as const, label: 'Max width' },
  minHeight: { type: 'number' as const, label: 'Min height' },
};

export const puckConfig: Config = {
  components: {
    HeroSection: {
      fields: {
        eyebrow: { type: 'text', label: 'Eyebrow' },
        title: { type: 'text', label: 'Title' },
        subtitle: { type: 'textarea', label: 'Subtitle' },
        buttons: {
          type: 'array',
          label: 'Buttons',
          defaultItemProps: {
            label: 'New Button',
            action: 'link',
            href: '/',
            variant: 'primary',
          },
          getItemSummary: (item: Record<string, unknown>, index?: number) => {
            const label = typeof item.label === 'string' && item.label.trim() ? item.label : `Button ${typeof index === 'number' ? index + 1 : ''}`;
            return label;
          },
          arrayFields: {
            label: { type: 'text', label: 'Label' },
            action: {
              type: 'select',
              label: 'Action',
              options: [
                { label: 'Book section', value: 'book' },
                { label: 'Menu section', value: 'menu' },
                { label: 'Custom link', value: 'link' },
              ],
            },
            href: { type: 'text', label: 'Link or anchor' },
            variant: {
              type: 'radio',
              label: 'Style',
              options: [
                { label: 'Primary', value: 'primary' },
                { label: 'Secondary', value: 'secondary' },
              ],
            },
          },
        },
        ...visualFields,
      },
      render: HeroSectionBlock,
    },
    PhilosophySection: { fields: visualFields, render: PhilosophySectionBlock },
    HistorySection: { fields: visualFields, render: HistorySectionBlock },
    MenuSection: { fields: visualFields, render: MenuSectionBlock },
    SeasonalSection: { fields: visualFields, render: SeasonalSectionBlock },
    EventsSection: { fields: visualFields, render: EventsSectionBlock },
    QuoteSection: { fields: visualFields, render: QuoteSectionBlock },
    NewsSection: { fields: visualFields, render: NewsSectionBlock },
    BookingSection: { fields: visualFields, render: BookingSectionBlock },
  },
};
