import React, { useState } from 'react';

const ImageWithFallback = ({ src, alt, className, ...props }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Set a timeout for image loading
  React.useEffect(() => {
    if (src) {
      const timer = setTimeout(() => {
        if (imageLoading) {
          console.warn('Image loading timeout:', src);
          setImageError(true);
          setImageLoading(false);
        }
      }, 10000); // 10 second timeout

      return () => clearTimeout(timer);
    }
  }, [src, imageLoading]);

  const handleImageLoad = () => {
    setImageLoading(false);
    console.log('✅ Image loaded successfully:', src);
  };

  const handleImageError = (e) => {
    console.error('❌ Image failed to load:', src, e);
    console.error('Error details:', {
      src,
      error: e.type,
      target: e.target
    });
    setImageError(true);
    setImageLoading(false);
  };

  // Try different image URL formats if the original fails
  const getFallbackImageUrl = (originalUrl) => {
    if (!originalUrl) return null;
    
    // Sometimes Google News images need different parameters
    if (originalUrl.includes('news.google.com')) {
      // Try removing some parameters that might cause issues
      return originalUrl.replace(/[?&]hl=[^&]*/, '').replace(/[?&]gl=[^&]*/, '').replace(/[?&]ceid=[^&]*/, '');
    }
    
    return originalUrl;
  };

  if (!src || imageError) {
    return (
      <div className="image-placeholder">
        <i className="fas fa-newspaper"></i>
        <span>No Image</span>
      </div>
    );
  }

  return (
    <div className="image-wrapper">
      {imageLoading && (
        <div className="image-loading-overlay">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Loading...</span>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={className}
        style={{ display: imageLoading ? 'none' : 'block' }}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
        {...props}
      />
      {imageError && (
        <div className="image-error-overlay">
          <i className="fas fa-exclamation-triangle"></i>
          <span>Image unavailable</span>
        </div>
      )}
    </div>
  );
};

export default ImageWithFallback;
