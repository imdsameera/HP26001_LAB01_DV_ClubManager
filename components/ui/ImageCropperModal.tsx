"use client";

import React, { useState, useRef, useEffect } from "react";
import Modal from "./Modal";
import Button from "./Button";
import { Crop, X, Check, RefreshCcw } from "lucide-react";

interface ImageCropperModalProps {
  imageFile: File | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (dataUrl: string) => void;
  onRetake: () => void;
}

export default function ImageCropperModal({ 
  imageFile, 
  isOpen, 
  onClose, 
  onComplete,
  onRetake
}: ImageCropperModalProps) {
  const [imageUrl, setImageUrl] = useState<string>("");
  const imgRef = useRef<HTMLImageElement>(null);

  // Crop State
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [hasCropped, setHasCropped] = useState(false);
  const [imgBounds, setImgBounds] = useState({ left: 0, top: 0 });

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImageUrl(url);
      setHasCropped(false);
      setStartPos({ x: 0, y: 0 });
      setCurrentPos({ x: 0, y: 0 });
      return () => URL.revokeObjectURL(url);
    }
  }, [imageFile]);

  // Calculate coordinates matching container styles
  const getCoordinates = (clientX: number, clientY: number) => {
    if (!imgRef.current) return { x: 0, y: 0 };
    const rect = imgRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(clientY - rect.top, rect.height));
    return { x, y };
  };

  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setHasCropped(true);
    const pos = getCoordinates(clientX, clientY);
    setStartPos(pos);
    setCurrentPos(pos);
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    const pos = getCoordinates(clientX, clientY);
    setCurrentPos(pos);
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  // Mouse Listeners
  const onMouseDown = (e: React.MouseEvent) => handleStart(e.clientX, e.clientY);
  const onMouseMove = (e: React.MouseEvent) => handleMove(e.clientX, e.clientY);
  const onMouseUp = () => handleEnd();

  // Touch Listeners
  const onTouchStart = (e: React.TouchEvent) => handleStart(e.touches[0].clientX, e.touches[0].clientY);
  const onTouchMove = (e: React.TouchEvent) => handleMove(e.touches[0].clientX, e.touches[0].clientY);
  const onTouchEnd = () => handleEnd();

  const handleComplete = () => {
    if (!imgRef.current) return;
    
    // If user never cropped, just export the full image compressed
    if (!hasCropped) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = imgRef.current.naturalWidth;
      canvas.height = imgRef.current.naturalHeight;
      ctx.drawImage(imgRef.current, 0, 0);
      onComplete(canvas.toDataURL("image/jpeg", 0.8));
      return;
    }

    const x = Math.min(startPos.x, currentPos.x);
    const y = Math.min(startPos.y, currentPos.y);
    const width = Math.abs(currentPos.x - startPos.x);
    const height = Math.abs(currentPos.y - startPos.y);

    // Provide bounds
    if (width < 10 || height < 10) return; // Discard tiny accidental taps

    const scaleX = imgRef.current.naturalWidth / imgRef.current.clientWidth;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.clientHeight;

    const sx = x * scaleX;
    const sy = y * scaleY;
    const sWidth = width * scaleX;
    const sHeight = height * scaleY;

    const canvas = document.createElement("canvas");
    canvas.width = sWidth;
    canvas.height = sHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(imgRef.current, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);
    
    // Save to DataURL and send up
    onComplete(canvas.toDataURL("image/jpeg", 0.9));
  };

  if (!isOpen || !imageFile) return null;

  // Visual Overlay Box
  const activeX = Math.min(startPos.x, currentPos.x);
  const activeY = Math.min(startPos.y, currentPos.y);
  const activeW = Math.abs(currentPos.x - startPos.x);
  const activeH = Math.abs(currentPos.y - startPos.y);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crop Receipt" maxWidth="max-w-2xl">
      <div className="p-4 flex flex-col items-center bg-gray-50 h-[70vh]">
        
        <div className="text-sm text-gray-500 mb-4 flex items-center justify-center gap-2">
          <Crop className="w-4 h-4" /> 
          Drag to outline the receipt. Leave uncropped to save whole image.
        </div>
        
        {/* Workspace */}
        <div 
          className="relative flex-1 w-full flex items-center justify-center overflow-hidden bg-black/5 rounded-xl border border-gray-200"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {imageUrl && (
            <img 
              ref={imgRef}
              src={imageUrl} 
              alt="Receipt Preview" 
              className="max-w-full max-h-full object-contain pointer-events-none select-none"
              draggable={false}
              onLoad={(e) => {
                setImgBounds({
                  left: e.currentTarget.offsetLeft,
                  top: e.currentTarget.offsetTop
                });
              }}
            />
          )}

          {/* Cropper Overlay */}
          {hasCropped && imgBounds && (
            <div 
              className="absolute border border-blue-500 bg-[#0066FF]/10 z-10 pointer-events-none"
              style={{
                left: imgBounds.left + activeX,
                top: imgBounds.top + activeY,
                width: activeW,
                height: activeH,
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)"
              }}
            />
          )}
        </div>

        {/* Buttons */}
        <div className="flex w-full gap-3 mt-6">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            <X className="w-4 h-4 mr-2" /> Cancel
          </Button>
          <Button variant="outline" className="flex-1 text-[#0066FF] border-[#0066FF]/30" onClick={onRetake}>
            <RefreshCcw className="w-4 h-4 mr-2" /> Retake
          </Button>
          <Button variant="primary" className="flex-1 bg-[#0066FF]" onClick={handleComplete}>
            <Check className="w-4 h-4 mr-2" /> Save & Crop
          </Button>
        </div>
      </div>
    </Modal>
  );
}
