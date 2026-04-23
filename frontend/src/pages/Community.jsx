import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useCommunityStore } from '../store/communityStore';
import { useAuthStore } from '../store/authStore';
import CreatePostModal from '../components/community/CreatePostModal';
import { Plus, MapPin, Tag, Box, Loader2, Image as ImageIcon } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const PostCard = ({ post }) => {
  const isSell = post.transactionType === 'SELL';
  const imageUrl = post.imageId ? `${API_BASE_URL}/community/images/${post.imageId}` : null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card overflow-hidden p-0 flex flex-col"
    >
      {/* Image Block */}
      <div className="relative h-48 bg-gray-100 border-b border-gray-100 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={post.cropType} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="text-gray-400 flex flex-col items-center justify-center">
            <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-xs uppercase font-medium tracking-wider">No Photo</span>
          </div>
        )}
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm ${isSell ? 'bg-green-500' : 'bg-blue-500'}`}>
          {isSell ? 'SELLING' : 'BUYING'}
        </div>
      </div>

      {/* Content Block */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-text-primary capitalize">{post.cropType}</h3>
          <span className="text-lg font-black text-primary">₹{post.price}</span>
        </div>
        
        <p className="text-sm text-text-secondary mb-4 line-clamp-2 flex-1">
          {post.description}
        </p>

        <div className="space-y-2 mt-auto">
          <div className="flex items-center gap-2 text-xs text-text-secondary bg-gray-50 px-2 py-1.5 rounded-md">
            <Box className="w-3.5 h-3.5" />
            <span className="font-medium text-text-primary">Qty:</span> {post.quantity}
          </div>
          <div className="flex items-center gap-2 text-xs text-text-secondary bg-gray-50 px-2 py-1.5 rounded-md">
            <MapPin className="w-3.5 h-3.5" />
            {post.location}
          </div>
          <div className="flex items-center gap-2 text-xs text-text-secondary bg-gray-50 px-2 py-1.5 rounded-md">
            <Tag className="w-3.5 h-3.5" />
            <span className="font-medium text-text-primary">Seller:</span> {post.userId?.name || 'Unknown'}
          </div>
        </div>

        <button 
          onClick={() => {
            if (post.userId?.phone) {
              window.location.href = `tel:${post.userId.phone}`;
            } else {
              alert("Contact details are not available for this user.");
            }
          }}
          className={`w-full mt-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${
            isSell ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
          }`}
        >
          Contact {isSell ? 'Seller' : 'Buyer'}
        </button>
      </div>
    </motion.div>
  );
};

const Community = () => {
  const { posts, isLoading, error, fetchPosts, createPost, filterTransactionType, setFilters } = useCommunityStore();
  const { isAuthenticated } = useAuthStore();
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
          <h1 className="text-2xl font-bold text-text-primary">Farmer Marketplace</h1>
          <p className="text-text-secondary mt-1">Buy and sell crops or equipment locally.</p>
        </div>

        <div className="flex flex-col sm:flex-row w-full md:w-auto items-stretch sm:items-center gap-3 mt-2 md:mt-0">
          <select 
            value={filterTransactionType}
            onChange={(e) => setFilters({ filterTransactionType: e.target.value })}
            className="input-field py-2.5 bg-white shadow-sm w-full sm:w-auto"
          >
            <option value="">All Listings</option>
            <option value="SELL">Items for Sale</option>
            <option value="BUY">Items Wanted</option>
          </select>
          
          <button 
            onClick={() => {
              if (isAuthenticated) {
                setIsModalOpen(true);
              } else {
                alert("Please login to create a listing.");
              }
            }}
            className="btn-primary py-2.5 flex items-center justify-center gap-2 whitespace-nowrap shadow-sm w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Listing</span>
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
          <p>Loading market listings...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 sm:p-16 text-center card bg-gray-50/50 border-dashed">
          <Box className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-1">No listings found</h3>
          <p className="text-sm text-text-secondary max-w-sm">There are currently no items in the marketplace. Be the first to create a listing!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {posts.map(post => (
            <PostCard key={post._id} post={post} />
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
