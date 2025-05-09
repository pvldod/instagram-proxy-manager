'use client'

import { useState, useRef } from 'react'
import { Input } from './input'
import { Label } from './label'
import { Upload } from 'lucide-react'

interface FileUploadProps {
  id: string
  name: string
  accept?: string
  required?: boolean
  label?: string
  helpText?: string
}

export function FileUpload({
  id,
  name,
  accept = '',
  required = false,
  label,
  helpText
}: FileUploadProps) {
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    } else {
      setFileName('');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (inputRef.current) {
        // Create a DataTransfer object
        const dataTransfer = new DataTransfer();
        
        // Add the first file
        dataTransfer.items.add(e.dataTransfer.files[0]);
        
        // Set the input's files
        inputRef.current.files = dataTransfer.files;
        
        // Set the file name
        setFileName(e.dataTransfer.files[0].name);
      }
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label htmlFor={id}>{label}</Label>}
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging 
            ? 'border-primary bg-primary/5' 
            : fileName 
              ? 'border-primary/50' 
              : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Input 
          ref={inputRef}
          id={id} 
          name={name} 
          type="file" 
          accept={accept} 
          className="hidden"
          required={required}
          onChange={handleFileChange}
        />
        <label htmlFor={id} className="cursor-pointer flex flex-col items-center justify-center h-full w-full">
          <Upload className="h-12 w-12 text-gray-400 mb-3" />
          <span className="text-base font-medium text-gray-600 dark:text-gray-400 mb-1">
            Click to select a file
          </span>
          <span className="text-sm text-gray-500 mb-3">
            or drag and drop file here
          </span>
          {fileName && (
            <span className="mt-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 text-sm rounded">
              {fileName}
            </span>
          )}
        </label>
      </div>
      {helpText && (
        <p className="text-sm text-gray-500 mt-1 flex items-center">
          <span className="bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 w-5 h-5 flex items-center justify-center rounded-full text-xs mr-2">i</span>
          {helpText}
        </p>
      )}
    </div>
  )
} 