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
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white p-8 flex flex-col items-center">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl w-full"
      >
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Give me a music, I will show you how happy or sad it is...
          </h1>
        
            <p className="text-xl text-gray-600 dark:text-gray-400">
                Generate image based on the emotion of your music!
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column: Upload & Controls */}
          <div className="flex flex-col h-full">
            <motion.div 
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer flex-grow flex flex-col justify-center items-center min-h-[500px]
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
              
              <div className="flex flex-col items-center justify-center space-y-4 w-full max-w-2xl">
                {file ? (
                  <>
                    <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                      <FaMusic size={48} />
                    </div>
                    <div>
                      <p className="font-semibold text-2xl text-green-600 dark:text-green-400">{file.name}</p>
                      <p className="text-lg text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    {audioUrl && (
                      <audio controls src={audioUrl} className="mt-6 w-full" onClick={(e) => e.stopPropagation()} />
                    )}
                    <p className="text-xs text-gray-500 mt-2">Click or drag to replace</p>
                  </>
                ) : (
                  <>
                    <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <FaCloudUploadAlt size={48} />
                    </div>
                    <div>
                      <p className="font-semibold text-2xl">Drop your music here</p>
                      <p className="text-lg text-gray-500">or click to browse</p>
                    </div>
                  </>
                )}
              </div>
            </motion.div>

            <motion.button
              onClick={handleSubmit}
              disabled={!file || loading}
              className={`w-full py-4 mt-8 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all
                ${!file || loading 
                  ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed' 
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
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M8.32181 14.4933C7.3798 15.9862 6.90879 16.7327 7.22969 17.3433C7.55059 17.9538 8.45088 18.0241 10.2514 18.1647L10.7173 18.201C11.2289 18.241 11.4848 18.261 11.7084 18.3785C11.9321 18.4961 12.0983 18.6979 12.4306 19.1015L12.7331 19.469C13.9026 20.8895 14.4873 21.5997 15.1543 21.5084C15.8213 21.417 16.1289 20.5846 16.7439 18.9198L16.9031 18.4891C17.0778 18.0161 17.1652 17.7795 17.3369 17.6078C17.5086 17.4362 17.7451 17.3488 18.2182 17.174L18.6489 17.0149C20.3137 16.3998 21.1461 16.0923 21.2374 15.4253C21.3288 14.7583 20.6185 14.1735 19.1981 13.0041M17.8938 10.5224C17.7532 8.72179 17.6829 7.8215 17.0723 7.5006C16.4618 7.1797 15.7153 7.65071 14.2224 8.59272L13.8361 8.83643C13.4119 9.10412 13.1998 9.23797 12.9554 9.27143C12.7111 9.30488 12.4622 9.23416 11.9644 9.09271L11.5113 8.96394C9.75959 8.46619 8.88375 8.21732 8.41508 8.68599C7.94641 9.15467 8.19528 10.0305 8.69303 11.7822" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M13.5 6.5L13 6M9.5 2.5L11.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M6.5 6.5L4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M6 12L4.5 10.5M2 8L2.5 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
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
          <div className="flex flex-col items-center justify-center min-h-[600px] h-full bg-gray-100 dark:bg-gray-800/30 rounded-3xl border border-gray-200 dark:border-gray-700/50 p-8 relative overflow-hidden">
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
