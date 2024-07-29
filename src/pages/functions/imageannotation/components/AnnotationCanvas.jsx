import React, { useState, useRef, useEffect } from 'react';

const AnnotationCanvas = ({ imageUrl, onAddAnnotation }) => {
  const [startPos, setStartPos] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [image, setImage] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const canvasRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImage(img);
      const aspectRatio = img.width / img.height;
      const canvasWidth = 700;
      const canvasHeight = canvasWidth / aspectRatio;
      setImageDimensions({ width: canvasWidth, height: canvasHeight });
    };
    img.src = imageUrl;

    return () => {
      img.onload = null; // Cleanup: Remove the onload handler
    };
  }, [imageUrl]);

  useEffect(() => {
    if (image) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      canvas.width = imageDimensions.width;
      canvas.height = imageDimensions.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    }
  }, [image, imageDimensions]);

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setStartPos({ x, y });
    setIsDrawing(true);
  };

  const handleMouseUp = (e) => {
    if (isDrawing) {
      setIsDrawing(false);

      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const coordinates = {
        x: startPos.x,
        y: startPos.y,
        width: x - startPos.x,
        height: y - startPos.y,
      };
      onAddAnnotation(coordinates);
    }
  };

  const handleMouseMove = (e) => {
    if (isDrawing) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(image, 0, 0, imageDimensions.width, imageDimensions.height);
      ctx.strokeRect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
    }
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={imageDimensions.width}
        height={imageDimensions.height}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{ border: '1px solid black' }}
      />
    </div>
  );
};

export default AnnotationCanvas;
 