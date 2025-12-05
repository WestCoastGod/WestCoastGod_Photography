import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMusic, FaImage, FaSpinner, FaCloudUploadAlt } from 'react-icons/fa';

const MusicToImage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ valence: number; arousal: number; image: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setAudioUrl(null);
    }
  }, [file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('audio/')) {
        setFile(droppedFile);
        setResult(null);
        setError(null);
      } else {
        setError("Please upload a valid audio file.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/music-to-image`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while generating the image. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 lg:left-48 bg-white dark:bg-black text-gray-900 dark:text-white p-4 md:p-8 flex flex-col items-center overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl w-full h-full flex flex-col"
      >
        <div className="text-center mb-4 lg:mb-8 flex-none mt-12 lg:mt-0 px-4">
          <h1 className="text-lg md:text-4xl font-bold mb-2 md:mb-4 text-gray-900 dark:text-white leading-tight">
            Drop a beat, and I'll expose its emotional baggage.
          </h1>
        
            <p className="text-sm md:text-xl text-gray-600 dark:text-gray-400">
                Generate image based on the emotion of your music!
            </p>
        </div>

        <div className="grid grid-rows-2 lg:grid-rows-1 grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-12 flex-grow min-h-0">
          {/* Left Column: Upload & Controls */}
          <div className="flex flex-col h-full min-h-0">
            <motion.div 
              className={`relative border-2 border-dashed rounded-2xl p-4 md:p-12 text-center transition-all duration-300 cursor-pointer flex-grow flex flex-col justify-center items-center overflow-hidden
                ${dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-800/50'}
                ${file ? 'border-green-500/50' : ''}
              `}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileInput}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="hidden"
              />
              
              <div className="flex flex-col items-center justify-center space-y-2 md:space-y-4 w-full max-w-2xl">
                {file ? (
                  <>
                    <div className="w-16 h-16 md:w-24 md:h-24 bg-green-500/20 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                      <FaMusic size={32} className="md:text-5xl" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg md:text-2xl text-green-600 dark:text-green-400 truncate max-w-[200px] md:max-w-full">{file.name}</p>
                      <p className="text-sm md:text-lg text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    {audioUrl && (
                      <audio controls src={audioUrl} className="mt-2 md:mt-6 w-full" onClick={(e) => e.stopPropagation()} />
                    )}
                    <p className="text-[10px] md:text-xs text-gray-500 mt-1 md:mt-2">Click or drag to replace</p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 md:w-24 md:h-24 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <FaCloudUploadAlt size={32} className="md:text-5xl" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg md:text-2xl">Drop your music here</p>
                      <p className="text-sm md:text-lg text-gray-500">or click to browse</p>
                    </div>
                  </>
                )}
              </div>
            </motion.div>

            <motion.button
              onClick={handleSubmit}
              disabled={!file || loading}
              className={`w-full py-3 md:py-4 mt-4 md:mt-8 rounded-xl font-bold text-base md:text-lg flex items-center justify-center gap-3 transition-all flex-none 
                  ${(!file || loading) 
                    ? 'bg-gray-200 dark:bg-gray-800 text-black dark:text-gray-500 cursor-not-allowed' 
                    : 'bg-black dark:bg-gray-700 text-white dark:text-white border border-transparent dark:border-gray-600 hover:opacity-80 shadow-lg'}
              `}
              whileHover={!file || loading ? {} : { scale: 1.02 }}
              whileTap={!file || loading ? {} : { scale: 0.98 }}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <img 
                    src="/images/star_generate.svg" 
                    alt="Generate" 
                    className={`w-6 h-6 ${!file ? 'dark:invert' : 'invert'}`} 
                  />
                  <span>Generate</span>
                </>
              )}
            </motion.button>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/50 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm mt-4"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Results */}
          <div className="flex flex-col items-center justify-center h-full min-h-0 bg-gray-100 dark:bg-gray-800/30 rounded-3xl border border-gray-200 dark:border-gray-700/50 p-4 md:p-8 relative overflow-hidden">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center space-y-4"
                >
                  <div className="relative w-24 h-24">
                    <div className="absolute inset-0 border-4 border-gray-300 dark:border-gray-600 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-black dark:border-t-white rounded-full animate-spin"></div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 animate-pulse">Analyzing audio...</p>
                </motion.div>
              ) : result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full space-y-6"
                >
                  <div className="relative group">
                    <img 
                      src={result.image} 
                      alt="Generated Landscape" 
                      className="w-full rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/50 transition-transform duration-500 group-hover:scale-[1.02]" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-800/80 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">Valence (Mood)</span>
                        <span className="text-gray-900 dark:text-white font-mono">{result.valence.toFixed(1)}</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(result.valence / 9) * 100}%` }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className="h-full bg-gray-900 dark:bg-white"
                        />
                      </div>
                      <div className="flex justify-between mt-1 text-[10px] text-gray-500 dark:text-gray-400">
                        <span>Sad</span>
                        <span>Happy</span>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800/80 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">Arousal (Energy)</span>
                        <span className="text-gray-900 dark:text-white font-mono">{result.arousal.toFixed(1)}</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(result.arousal / 9) * 100}%` }}
                          transition={{ duration: 1, delay: 0.7 }}
                          className="h-full bg-gray-900 dark:bg-white"
                        />
                      </div>
                      <div className="flex justify-between mt-1 text-[10px] text-gray-500 dark:text-gray-400">
                        <span>Calm</span>
                        <span>Energetic</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-gray-400 dark:text-gray-600"
                >
                  <FaImage size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Your generated landscape will appear here</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MusicToImage;
