import React, { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CreatePostModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    transactionType: 'SELL',
    cropType: '',
    description: '',
    price: '',
    quantity: '',
    location: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("Image must be smaller than 10MB");
        return;
      }
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      await onSubmit(submitData);
      
      // Reset form
      setFormData({
        transactionType: 'SELL',
        cropType: '',
        description: '',
        price: '',
        quantity: '',
        location: ''
      });
      setImageFile(null);
      setPreviewUrl(null);
      onClose();
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-surface rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
              <h2 className="text-lg font-semibold text-text-primary">Create Marketplace Listing</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto">
              <form id="post-form" onSubmit={handleSubmit} className="space-y-4">
                
                <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                  {['SELL', 'BUY'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, transactionType: type }))}
                      className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                        formData.transactionType === type 
                          ? (type === 'SELL' ? 'bg-green-500 text-white shadow-sm' : 'bg-blue-500 text-white shadow-sm') 
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {type === 'SELL' ? 'I Want to Sell' : 'I Want to Buy'}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Crop/Item Name</label>
                    <input required name="cropType" value={formData.cropType} onChange={handleInputChange} className="w-full input-field" placeholder="e.g. Wheat, Tractor" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Total Quantity</label>
                    <input required name="quantity" value={formData.quantity} onChange={handleInputChange} className="w-full input-field" placeholder="e.g. 50 kg" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Price (₹)</label>
                    <input required type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full input-field" placeholder="Enter amount" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Location</label>
                    <input required name="location" value={formData.location} onChange={handleInputChange} className="w-full input-field" placeholder="Village / District" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
                  <textarea required name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full input-field resize-none" placeholder="Add details about quality, transport, etc." />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">Photo Upload</label>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                  
                  {previewUrl ? (
                    <div className="relative rounded-xl overflow-hidden border border-gray-200 aspect-video bg-gray-50 flex items-center justify-center group cursor-pointer" onClick={() => fileInputRef.current.click()}>
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white font-medium flex items-center gap-2">
                          <Upload className="w-4 h-4" /> Change Photo
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div onClick={() => fileInputRef.current.click()} className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 hover:text-primary hover:border-primary hover:bg-primary-50 transition-colors cursor-pointer aspect-video">
                      <ImageIcon className="w-8 h-8 mb-2" />
                      <span className="text-sm font-medium">Click to upload photo</span>
                      <span className="text-xs mt-1">JPEG, PNG up to 10MB</span>
                    </div>
                  )}
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <button 
                type="submit" 
                form="post-form" 
                disabled={isSubmitting}
                className="w-full btn-primary py-3 flex items-center justify-center"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Post to Community'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreatePostModal;
