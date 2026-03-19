import React from 'react';

export interface HomepageSectionBlockProps {
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

const px = (value?: number) => (typeof value === 'number' ? `${value}px` : undefined);

export const createHomepageSectionBlock = (defaultMinHeight = 220): React.FC<HomepageSectionBlockProps> => {
  const HomepageSectionBlock: React.FC<HomepageSectionBlockProps> = ({
    backgroundColor,
    backgroundImage,
    overlayColor,
    textColor,
    accentColor,
    surfaceColor,
    borderColor,
    paddingTop,
    paddingBottom,
    maxWidth,
    minHeight,
  }) => (
    <section
      style={{
        position: 'relative',
        width: '100%',
        minHeight: px(minHeight ?? defaultMinHeight),
        paddingTop: px(paddingTop),
        paddingBottom: px(paddingBottom),
        backgroundColor,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundPosition: backgroundImage ? 'center' : undefined,
        backgroundRepeat: backgroundImage ? 'no-repeat' : undefined,
        backgroundSize: backgroundImage ? 'cover' : undefined,
        overflow: 'hidden',
      }}
    >
      {overlayColor ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: overlayColor,
          }}
        />
      ) : null}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: px(maxWidth) || '960px',
          margin: '0 auto',
          padding: '32px',
        }}
      >
        <div
          style={{
            border: `1px solid ${borderColor || 'rgba(205,162,53,0.25)'}`,
            backgroundColor: surfaceColor || 'rgba(255,255,255,0.72)',
            color: textColor || '#1a1a1a',
            padding: '24px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '3px',
              backgroundColor: accentColor || '#cda235',
              marginBottom: '16px',
            }}
          />
          <div style={{ fontSize: '18px', lineHeight: 1.5 }}>Homepage section</div>
        </div>
      </div>
    </section>
  );

  return HomepageSectionBlock;
};
