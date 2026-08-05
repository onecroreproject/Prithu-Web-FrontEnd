import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, ImageIcon, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';

const TryInPrithuModal = ({ isOpen, onClose, promptDetail, walletBalance, onSuccess }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedImages, setGeneratedImages] = useState(null);
  
  const costPerImage = 3;
  const totalCost = Math.max(1, images.length) * costPerImage; 

  useEffect(() => {
    if (!isOpen) {
      setImages([]);
      setLoading(false);
      setProgress(0);
      setGeneratedImages(null);
    }
  }, [isOpen]);

  useEffect(() => {
    let interval;
    if (loading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 2;
        });
      }, 300);
    } else {
      setProgress(100);
      if (interval) clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [loading]);

  if (!isOpen) return null;

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      toast.error("You can upload a maximum of 5 images.");
      return;
    }

    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    const imageCount = Math.max(1, images.length);
    const finalCost = imageCount * costPerImage;

    if (walletBalance < finalCost) {
      toast.error("Insufficient credits! Please buy more credits.");
      return;
    }

    const formData = new FormData();
    formData.append('promptId', promptDetail.id || promptDetail._id);
    formData.append('promptText', promptDetail.prompt);
    formData.append('imageCount', imageCount);
    images.forEach((img) => formData.append('images', img.file));

    setLoading(true);
    try {
      const res = await api.post(`/api/wallet/generate`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        toast.success('Images generated successfully!');
        setGeneratedImages(res.data.images);
        if (onSuccess) onSuccess(res.data.wallet.balance, res.data.images);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to generate image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 15 }}
          className="bg-gray-900 rounded-2xl w-full max-w-lg border border-gray-700 overflow-hidden shadow-2xl relative"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
          
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              {generatedImages ? 'Your Generated Artwork' : 'Try In Prithu'}
            </h2>

            {generatedImages ? (
              <div className="flex flex-col items-center">
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {generatedImages.map((img, idx) => (
                    <div key={idx} className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-700 bg-gray-800">
                      <img src={img} alt={`Generated ${idx}`} className="w-full h-auto object-cover" />
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 w-full">
                  <button
                    onClick={() => setGeneratedImages(null)}
                    className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-all"
                  >
                    Generate More
                  </button>
                  <button
                    onClick={() => {
                      generatedImages.forEach(img => {
                        fetch(img)
                          .then(response => response.blob())
                          .then(blob => {
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `prithu-ai-generation-${Date.now()}.png`;
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                            window.URL.revokeObjectURL(url);
                          })
                          .catch(() => window.open(img, '_blank'));
                      });
                    }}
                    className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Upload className="w-5 h-5 rotate-180" />
                    Download
                  </button>
                </div>
              </div>
            ) : loading ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Generating Masterpiece...</h3>
                <p className="text-sm text-gray-400 text-center max-w-sm mb-6">Our AI is crafting your image. This might take a few seconds.</p>
                <div className="w-full max-w-xs bg-gray-800 rounded-full h-3 mb-2 overflow-hidden relative">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
                  <div className="absolute top-0 left-0 right-0 bottom-0 bg-white/20 animate-pulse" />
                </div>
                <span className="text-xs font-bold text-indigo-400">{Math.floor(progress)}% Complete</span>
              </div>
            ) : (
              <>
                <p className="text-gray-400 text-sm mb-6">Upload 1 to 5 base images and we will generate variations using this prompt.</p>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Upload Images (Max 5)</label>
                  <div className="flex flex-wrap gap-3">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-600">
                        <img src={img.preview} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                        <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-500/80 text-white rounded-full p-0.5 hover:bg-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {images.length < 5 && (
                      <label className="w-20 h-20 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-600 hover:border-indigo-500 hover:bg-gray-800 cursor-pointer transition-colors">
                        <Upload className="w-5 h-5 text-gray-400 mb-1" />
                        <span className="text-[10px] text-gray-400">Upload</span>
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                    )}
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Images to Generate:</span>
                    <span className="font-bold text-white">{Math.max(1, images.length)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Cost Per Image:</span>
                    <span className="font-bold text-white">{costPerImage} CR</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                    <span className="text-gray-300 font-medium">Total Cost:</span>
                    <span className="font-bold text-red-400">-{totalCost} CR</span>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-gray-400 text-sm">Your Balance:</span>
                    <span className={`font-bold ${walletBalance >= totalCost ? 'text-green-400' : 'text-red-500'}`}>{walletBalance} CR</span>
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={loading || walletBalance < totalCost}
                  className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    walletBalance < totalCost ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg'
                  }`}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                  {walletBalance < totalCost ? 'Insufficient Credits' : `Generate (${totalCost} CR)`}
                </button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TryInPrithuModal;
