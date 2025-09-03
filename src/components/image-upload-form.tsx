'use client';

import { FileImage, UploadCloud, Camera, Globe, X, Send } from 'lucide-react';
import Image from 'next/image';
import React, { useCallback, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Input } from './ui/input';
import { Slider } from './ui/slider';

interface ImageUploadFormProps {
  onImageUpload: (file: File, enhancedDataUrl: string, region?: string) => void;
  disabled: boolean;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_DIMENSION = 1024;

export default function ImageUploadForm({ onImageUpload, disabled }: ImageUploadFormProps) {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [region, setRegion] = useState('');
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const validateFile = (file: File): boolean => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Unsupported File Type',
        description: 'Please upload a JPEG, PNG, or WEBP image.',
      });
      return false;
    }
    if (file.size > MAX_SIZE) {
      toast({
        variant: 'destructive',
        title: 'File Too Large',
        description: 'Please upload an image smaller than 10MB.',
      });
      return false;
    }
    return true;
  };

  const processAndPreviewImage = (file: File) => {
    if (!validateFile(file)) return;
    setOriginalFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
      setIsModalOpen(true);
      setBrightness(100);
      setContrast(100);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (file: File | null | undefined) => {
    if (file) {
      processAndPreviewImage(file);
    }
  };
  
  const applyEnhancements = useCallback(() => {
    if (!previewUrl || !canvasRef.current) return;

    const img = document.createElement('img');
    img.src = previewUrl;
    img.onload = () => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      let { width, height } = img;
      if (width > height) {
        if (width > MAX_DIMENSION) {
          height *= MAX_DIMENSION / width;
          width = MAX_DIMENSION;
        }
      } else {
        if (height > MAX_DIMENSION) {
          width *= MAX_DIMENSION / height;
          height = MAX_DIMENSION;
        }
      }
      canvas.width = width;
      canvas.height = height;

      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
      ctx.drawImage(img, 0, 0, width, height);
    };
  }, [previewUrl, brightness, contrast]);
  
  React.useEffect(() => {
    applyEnhancements();
  }, [applyEnhancements]);


  const handleSend = () => {
    if (!originalFile || !canvasRef.current) return;

    setIsProcessing(true);
    canvasRef.current.toBlob(
      (blob) => {
        if (blob) {
          const enhancedFile = new File([blob], originalFile.name, { type: originalFile.type });
          const enhancedDataUrl = canvasRef.current!.toDataURL(originalFile.type, 0.9);
          onImageUpload(enhancedFile, enhancedDataUrl, region);
          setIsModalOpen(false);
          setOriginalFile(null);
          setPreviewUrl(null);
        } else {
           toast({
            variant: 'destructive',
            title: 'Processing Failed',
            description: 'Could not process the image. Please try again.',
          });
        }
        setIsProcessing(false);
      },
      originalFile.type,
      0.9 // Compression quality
    );
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFileSelect(file);
  }, [region]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFileSelect(file);
    e.target.value = ''; // Reset file input
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div
          className={cn(
            'relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg transition-colors duration-300',
            isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <UploadCloud className={cn('w-12 h-12 mb-4 transition-colors', isDragging ? 'text-primary' : 'text-muted-foreground')} />
          <p className="text-center text-muted-foreground mb-4 text-sm sm:text-base">
            <span className="font-semibold text-primary">Drag & drop</span> an image here, or use the buttons below.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              variant="secondary"
              className='w-full'
            >
              <FileImage className="w-4 h-4 mr-2" />
              Select Image
            </Button>
            <Button
              onClick={() => cameraInputRef.current?.click()}
              disabled={disabled}
              variant="secondary"
              className='w-full'
            >
              <Camera className="w-4 h-4 mr-2" />
              Scan Image
            </Button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleInputChange}
            accept={ALLOWED_TYPES.join(',')}
            className="hidden"
            disabled={disabled}
          />
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handleInputChange}
            accept="image/*"
            capture="environment"
            className="hidden"
            disabled={disabled}
          />
          <p className="text-xs text-muted-foreground mt-4">PNG, JPG, WEBP up to 10MB</p>
        </div>

        <div className="relative">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Enter region for better accuracy (e.g., 'North America')"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="pl-10"
            disabled={disabled}
          />
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Enhance & Preview</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center items-center my-4">
            <canvas ref={canvasRef} className="max-w-full h-auto rounded-lg shadow-md" />
          </div>
          <div className="space-y-4">
            <div className="grid gap-2">
              <label htmlFor="brightness" className="text-sm font-medium">Brightness</label>
              <Slider id="brightness" min={50} max={150} value={[brightness]} onValueChange={(v) => setBrightness(v[0])} />
            </div>
            <div className="grid gap-2">
              <label htmlFor="contrast" className="text-sm font-medium">Contrast</label>
              <Slider id="contrast" min={50} max={150} value={[contrast]} onValueChange={(v) => setContrast(v[0])} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <Button onClick={handleSend} disabled={isProcessing}>
              <Send className="mr-2 h-4 w-4" /> {isProcessing ? 'Processing...' : 'Send for Analysis'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
