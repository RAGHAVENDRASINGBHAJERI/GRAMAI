import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useCommunityStore } from '../store/communityStore';
import { useAuthStore } from '../store/authStore';
import CreatePostModal from '../components/community/CreatePostModal';
import { Plus, MapPin, Tag, Box, Loader2, Image as ImageIcon } from 'lucide-react';
import { useAppTranslation } from '../hooks/useTranslation';
import configData from '../config.json';

const isProd = configData.mode === 'production';
const API_BASE_URL = isProd 
  ? configData.environments.production.apiUrl 
  : configData.environments.development.apiUrl;

const PostCard = ({ post, t, currentUser }) => {
  const isSell = post.transactionType === 'SELL';
  const [imageError, setImageError] = useState(false);
  
  // Cache busting to ensure the browser fetches the latest image even if a previous request failed
  const cacheBuster = post.updatedAt ? new Date(post.updatedAt).getTime() : Date.now();
  const imageUrl = post.imageId ? `${API_BASE_URL}/community/images/${post.imageId}?t=${cacheBuster}` : null;
  const isAdmin = currentUser?.role === 'admin';
  const seller = post.userId || {};
  const showImage = imageUrl && !imageError;

  return (
    <div style={{ perspective: 1200 }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -10, rotateX: 6, rotateY: 6, scale: 1.02 }}
        whileTap={{ scale: 0.99, rotateX: 0, rotateY: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
        className="card overflow-hidden p-0 flex flex-col h-full bg-surface shadow-sm border border-gray-100"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Image Block */}
      <div className="relative h-48 bg-gray-50 flex items-center justify-center overflow-hidden border-b border-gray-100">
        {showImage ? (
          <img 
            src={imageUrl} 
            alt={post.cropType} 
            className="w-full h-full object-cover transition-transform hover:scale-105 duration-300" 
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : null}
        
        {/* Fallback displayed if no image or image fails to load */}
        {!showImage && (
          <div className="text-gray-400 flex-col items-center justify-center w-full h-full bg-gray-50 flex">
            <ImageIcon className="w-10 h-10 mb-2 opacity-40 text-primary" />
            <span className="text-xs uppercase font-medium tracking-wider">{t('marketplace.noPhoto')}</span>
          </div>
        )}
        
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm ${isSell ? 'bg-green-500' : 'bg-blue-500'}`}>
          {isSell ? t('marketplace.selling') : t('marketplace.buying')}
        </div>
      </div>

      {/* Content Block */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-text-primary capitalize">{post.cropType}</h3>
          <span className="text-lg font-black text-primary">₹{post.price}</span>
        </div>
        
        <p className="text-sm text-text-secondary mb-4 line-clamp-2 min-h-[40px]">
          {post.description}
        </p>

        <div className="space-y-2 mt-auto">
          <div className="flex items-center gap-2 text-xs text-text-secondary bg-gray-50 px-2 py-1.5 rounded-md">
            <Box className="w-3.5 h-3.5" />
            <span className="font-medium text-text-primary">{t('marketplace.qty')}</span> {post.quantity}
          </div>
          <div className="flex items-center gap-2 text-xs text-text-secondary bg-gray-50 px-2 py-1.5 rounded-md">
            <MapPin className="w-3.5 h-3.5" />
            {post.location || 'No Location'}
          </div>
          
          <div className="flex flex-col gap-1 text-xs text-text-secondary bg-gray-50 p-2 rounded-md border border-gray-100">
            <div className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5" />
              <span className="font-medium text-text-primary">{t('marketplace.seller')}:</span> 
              {seller.name || 'Unknown User'}
            </div>
            {seller.phone && <div className="ml-5 text-gray-500">Phone: {seller.phone}</div>}
            {seller.email && <div className="ml-5 text-gray-500">Email: {seller.email}</div>}
          </div>
        </div>

        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
          <button 
            onClick={() => {
              if (seller.phone) {
                const userName = currentUser?.name || 'A user';
                const userEmail = currentUser?.email || 'N/A';
                const userPhone = currentUser?.phone || 'N/A';
                const msg = `Hello ${seller.name || ''}, I'm interested in your ${post.cropType} marketplace listing on GramaAI. My details are:\nName: ${userName}\nEmail: ${userEmail}\nMobile: ${userPhone}`;
                const uriMsg = encodeURIComponent(msg);
                
                window.open(`https://wa.me/${seller.phone.replace(/\D/g, '')}?text=${uriMsg}`, '_blank');
              } else if (seller.email) {
                window.location.href = `mailto:${seller.email}?subject=GramaAI Marketplace: ${post.cropType}`;
              } else {
                alert("Contact details (phone or email) are not available for this seller.");
              }
            }}
            className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm ${
              isSell ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200' : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            {isSell ? t('marketplace.contactSeller') : t('marketplace.contactBuyer')}
          </button>
          
          {(isAdmin || currentUser?._id === seller._id) && (
            <button 
              onClick={async () => {
                if (window.confirm('Are you sure you want to delete this listing?')) {
                  try {
                    const token = useAuthStore.getState().accessToken;
                    await fetch(`${API_BASE_URL}/community/posts/${post._id}`, {
                      method: 'DELETE',
                      headers: { Authorization: `Bearer ${token}` }
                    });
                    useCommunityStore.getState().fetchPosts(1);
                  } catch(e) {
                    alert('Failed to delete post');
                  }
                }
              }}
              className="px-4 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
              title="Delete Post"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </motion.div>
  </div>
  );
};

const Community = () => {
  const { t } = useAppTranslation();
  const { posts, isLoading, error, fetchPosts, createPost, filterTransactionType, setFilters } = useCommunityStore();
  const { isAuthenticated, user } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchPosts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{t('marketplace.title')}</h1>
          <p className="text-text-secondary mt-1">{t('marketplace.desc')}</p>
        </div>

        <div className="flex flex-col sm:flex-row w-full md:w-auto items-stretch sm:items-center gap-3 mt-2 md:mt-0">
          <select 
            value={filterTransactionType}
            onChange={(e) => setFilters({ filterTransactionType: e.target.value })}
            className="input-field py-2.5 bg-white shadow-sm w-full sm:w-auto"
          >
            <option value="">{t('marketplace.allListings')}</option>
            <option value="SELL">{t('marketplace.itemsForSale')}</option>
            <option value="BUY">{t('marketplace.itemsWanted')}</option>
          </select>
          
          <button 
            onClick={() => {
              if (isAuthenticated) {
                setIsModalOpen(true);
              } else {
                alert(t('marketplace.loginRequired'));
              }
            }}
            className="btn-primary py-2.5 flex items-center justify-center gap-2 whitespace-nowrap shadow-sm w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{t('marketplace.newListing')}</span>
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 text-error rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {/* Grid Feed */}
      {isLoading && posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-text-secondary">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p>{t('marketplace.loading')}</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 sm:p-16 text-center card bg-gray-50/50 border-dashed">
          <Box className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-1">{t('marketplace.noListings')}</h3>
          <p className="text-sm text-text-secondary max-w-sm">{t('marketplace.beFirst')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {posts.map(post => (
            <PostCard key={post._id} post={post} t={t} currentUser={user} />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <CreatePostModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={createPost}
      />
    </div>
  );
};

export default Community;
