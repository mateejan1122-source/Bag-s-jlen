import type { Data } from '@measured/puck';
import type { HomepageSectionVisualProps } from './homepageVisualConfig';

export type HeroButtonAction = 'book' | 'menu' | 'link';
export type HeroButtonVariant = 'primary' | 'secondary';

export interface HeroButtonProps {
  label: string;
  action: HeroButtonAction;
  href?: string;
  variant: HeroButtonVariant;
}

export interface HeroSectionProps extends HomepageSectionVisualProps {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  buttons?: HeroButtonProps[];
}

export const DEFAULT_HERO_BUTTONS: HeroButtonProps[] = [
  {
    label: 'Book Table',
    action: 'book',
    variant: 'primary',
  },
  {
    label: 'See Menu',
    action: 'menu',
    variant: 'secondary',
  },
];

export const DEFAULT_HERO_SECTION_PROPS: HeroSectionProps = {
  eyebrow: 'Welcome',
  title: 'Bag Sojlen',
  subtitle: 'Classic restaurant evenings, refined seasonal cooking, and room to stay awhile.',
  buttons: DEFAULT_HERO_BUTTONS,
};

const normalizeHeroButton = (
  value: unknown,
  index: number
): HeroButtonProps => {
  const candidate = value && typeof value === 'object' ? (value as Partial<HeroButtonProps>) : {};
  const fallback = DEFAULT_HERO_BUTTONS[index] || DEFAULT_HERO_BUTTONS[DEFAULT_HERO_BUTTONS.length - 1];

  return {
    label: typeof candidate.label === 'string' && candidate.label.trim() ? candidate.label : fallback.label,
    action: candidate.action === 'book' || candidate.action === 'menu' || candidate.action === 'link' ? candidate.action : fallback.action,
    href: typeof candidate.href === 'string' ? candidate.href : fallback.href,
    variant: candidate.variant === 'primary' || candidate.variant === 'secondary' ? candidate.variant : fallback.variant,
  };
};

export const normalizeHeroSectionProps = (value: unknown): HeroSectionProps => {
  const candidate = value && typeof value === 'object' ? (value as Partial<HeroSectionProps>) : {};

  return {
    ...candidate,
    eyebrow: typeof candidate.eyebrow === 'string' ? candidate.eyebrow : DEFAULT_HERO_SECTION_PROPS.eyebrow,
    title: typeof candidate.title === 'string' ? candidate.title : DEFAULT_HERO_SECTION_PROPS.title,
    subtitle: typeof candidate.subtitle === 'string' ? candidate.subtitle : DEFAULT_HERO_SECTION_PROPS.subtitle,
    buttons: Array.isArray(candidate.buttons) && candidate.buttons.length > 0
      ? candidate.buttons.map(normalizeHeroButton)
      : DEFAULT_HERO_BUTTONS,
  };
};

export const getHeroSectionProps = (data: Data | null | undefined): HeroSectionProps => {
  if (!data) {
    return DEFAULT_HERO_SECTION_PROPS;
  }

  const item = data.content.find((entry) => entry.type === 'HeroSection');
  return normalizeHeroSectionProps(item?.props);
};
