import { Box, CircularProgress, Skeleton } from "@mui/material";
import { useState } from "react";
import { useIntersectionObserver } from "~/hooks";

interface ImageWithPlaceholderProps {
  src: string;
  alt: string;
  placeholderSrc?: string; // base64 thumbnail for blur-up effect
  className?: string;
  width?: string | number;
  height?: string | number;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
}

export function ImageWithPlaceholder({
  src,
  alt,
  placeholderSrc,
  className = "",
  width,
  height,
  objectFit = "cover",
}: ImageWithPlaceholderProps) {
  const [imageRef, isVisible] = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.1,
    rootMargin: "50px",
    freezeOnceVisible: true,
  });

  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <Box
      ref={imageRef}
      sx={{
        position: "relative",
        width: width || "100%",
        height: height || "auto",
        overflow: "hidden",
      }}
      className={className}
    >
      {/* Placeholder/Loading state */}
      {!isLoaded && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {placeholderSrc ? (
            <img
              src={placeholderSrc}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit,
                filter: "blur(10px)",
                transform: "scale(1.1)",
              }}
            />
          ) : (
            <Skeleton
              variant="rectangular"
              width="100%"
              height={height || 200}
              animation="wave"
            />
          )}
          <CircularProgress
            size={40}
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              marginTop: "-20px",
              marginLeft: "-20px",
            }}
          />
        </Box>
      )}

      {/* Main image - only load when visible */}
      {isVisible && !hasError && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
          style={{
            width: "100%",
            height: "100%",
            objectFit,
            opacity: isLoaded ? 1 : 0,
            transition: "opacity 0.3s ease-in-out",
          }}
        />
      )}

      {/* Error state */}
      {hasError && (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f5f5f5",
            color: "#999",
          }}
        >
          <span>Failed to load image</span>
        </Box>
      )}
    </Box>
  );
}
