import React from 'react';

export interface HeroBlockProps {
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundPosition?: string;
  backgroundSize?: string;
  minHeight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  textColor?: string;
  children?: React.ReactNode;
}

export const HeroBlock: React.FC<HeroBlockProps> = ({
  backgroundColor,
  backgroundImage,
  backgroundPosition,
  backgroundSize,
  minHeight,
  paddingTop,
  paddingBottom,
  textColor,
  children,
}) => {
  return (
    <section
      style={{
        backgroundColor,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundPosition: backgroundPosition || 'center',
        backgroundRepeat: backgroundImage ? 'no-repeat' : undefined,
        backgroundSize: backgroundSize || 'cover',
        color: textColor,
        minHeight: minHeight ? `${minHeight}px` : undefined,
        paddingTop: paddingTop ? `${paddingTop}px` : undefined,
        paddingBottom: paddingBottom ? `${paddingBottom}px` : undefined,
        width: '100%',
      }}
    >
      {children}
    </section>
  );
};

