import { ImgHTMLAttributes } from 'react';

interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fill?: boolean;
  priority?: boolean;
  quality?: number;
}

export const Image = ({ fill, priority, quality, ...props }: ImageProps) => {
  // In a Vite environment, 'fill' usually means absolute positioning to fill container
  // We apply the styling here if fill is present, but DON'T pass the 'fill' prop to the <img> tag
  const fillStyles = fill ? {
    position: 'absolute' as const,
    height: '100%',
    width: '100%',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    objectFit: 'cover' as const,
  } : {};

  return (
    <img 
      {...props} 
      style={{ ...fillStyles, ...props.style }} 
      // Ensure we don't pass non-DOM attributes
    />
  );
};
