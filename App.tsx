
import React, { useState, useCallback } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { ImageDisplay } from './components/ImageDisplay';
import { editImageWithControls } from './services/geminiService';
import { EditControls } from './types';
import { INITIAL_CONTROLS } from './constants';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalImageType, setOriginalImageType] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [controls, setControls] = useState<EditControls>(INITIAL_CONTROLS);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage((reader.result as string).split(',')[1]);
        setOriginalImageType(file.type);
        setEditedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!originalImage || !originalImageType) {
      setError("Please upload an image first.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setEditedImage(null);

    try {
      const result = await editImageWithControls(originalImage, originalImageType, controls);
      setEditedImage(result);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, originalImageType, controls]);

  const handleUseAsOriginal = () => {
    if (editedImage) {
      setOriginalImage(editedImage);
      setOriginalImageType('image/png'); // Gemini API returns png
      setEditedImage(null);
      setError(null);
      setControls(INITIAL_CONTROLS);
    }
  };


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col font-sans">
      <header className="bg-gray-800/50 backdrop-blur-sm p-4 border-b border-gray-700 shadow-lg sticky top-0 z-10">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
          ឧបករណ៍បញ្ជារូបភាព AI (AI Image Controller)
        </h1>
        <p className="text-center text-gray-400 text-sm mt-1">បញ្ជាវត្ថុ មនុស្ស និងទិដ្ឋភាពកាមេរ៉ាដោយប្រើ Gemini (Control objects, people, and camera perspectives with Gemini)</p>
      </header>
      
      <main className="flex-grow flex flex-col lg:flex-row p-4 gap-4">
        <div className="flex-grow lg:w-2/3 flex flex-col">
          <ImageDisplay 
            originalImage={originalImage}
            originalImageType={originalImageType}
            editedImage={editedImage}
            isLoading={isLoading}
            error={error}
            onImageUpload={handleImageUpload}
            onUseAsOriginal={handleUseAsOriginal}
          />
        </div>
        
        <div className="lg:w-1/3 flex flex-col">
          <ControlPanel 
            controls={controls}
            setControls={setControls}
            onGenerate={handleGenerate}
            isLoading={isLoading}
            isImageUploaded={!!originalImage}
          />
        </div>
      </main>
    </div>
  );
};

export default App;