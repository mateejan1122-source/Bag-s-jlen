import React from 'react';

export interface TextBlockProps {
  text?: string;
  color?: string;
  fontSize?: number;
  fontWeight?: string;
  lineHeight?: number;
  maxWidth?: number;
  paddingTop?: number;
  paddingBottom?: number;
  textAlign?: 'left' | 'center' | 'right';
}

export const TextBlock: React.FC<TextBlockProps> = ({
  text,
  color,
  fontSize,
  fontWeight,
  lineHeight,
  maxWidth,
  paddingTop,
  paddingBottom,
  textAlign,
}) => {
  if (!text) {
    return null;
  }

  return (
    <div
      style={{
        color,
        fontSize: fontSize ? `${fontSize}px` : undefined,
        fontWeight,
        lineHeight: lineHeight || undefined,
        marginLeft: textAlign === 'center' ? 'auto' : undefined,
        marginRight: textAlign === 'center' ? 'auto' : undefined,
        maxWidth: maxWidth ? `${maxWidth}px` : undefined,
        paddingTop: paddingTop ? `${paddingTop}px` : undefined,
        paddingBottom: paddingBottom ? `${paddingBottom}px` : undefined,
        textAlign,
        width: '100%',
      }}
    >
      {text}
    </div>
  );
};

