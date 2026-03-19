import React from 'react';

export interface SectionBlockProps {
  backgroundColor?: string;
  backgroundImage?: string;
  maxWidth?: number;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  children?: React.ReactNode;
}

export const SectionBlock: React.FC<SectionBlockProps> = ({
  backgroundColor,
  backgroundImage,
  maxWidth,
  paddingTop,
  paddingBottom,
  paddingLeft,
  paddingRight,
  children,
}) => {
  return (
    <section
      style={{
        backgroundColor,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundPosition: backgroundImage ? 'center' : undefined,
        backgroundRepeat: backgroundImage ? 'no-repeat' : undefined,
        backgroundSize: backgroundImage ? 'cover' : undefined,
        paddingTop: paddingTop ? `${paddingTop}px` : undefined,
        paddingBottom: paddingBottom ? `${paddingBottom}px` : undefined,
        paddingLeft: paddingLeft ? `${paddingLeft}px` : undefined,
        paddingRight: paddingRight ? `${paddingRight}px` : undefined,
        width: '100%',
      }}
    >
      <div
        style={{
          margin: '0 auto',
          maxWidth: maxWidth ? `${maxWidth}px` : undefined,
          width: '100%',
        }}
      >
        {children}
      </div>
    </section>
  );
};

