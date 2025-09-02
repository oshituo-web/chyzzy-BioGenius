'use client';

import { FileImage, UploadCloud, Camera, Globe } from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Input } from './ui/input';

interface ImageUploadFormProps {
  onImageUpload: (file: File, region?: string) => void;
  disabled: boolean;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export default function ImageUploadForm({ onImageUpload, disabled }: ImageUploadFormProps) {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [region, setRegion] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = (file: File | null | undefined) => {
    if (file && validateFile(file)) {
      onImageUpload(file, region);
    }
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
  }, [region, handleFileSelect]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFileSelect(file);
  };

  return (
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
        <p className="text-center text-muted-foreground mb-4">
          <span className="font-semibold text-primary">Drag & drop</span> an image here, or use the buttons below.
        </p>
        <div className="flex gap-2">
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            variant="secondary"
          >
            <FileImage className="w-4 h-4 mr-2" />
            Select Image
          </Button>
          <Button
            onClick={() => cameraInputRef.current?.click()}
            disabled={disabled}
            variant="secondary"
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
  );
}
