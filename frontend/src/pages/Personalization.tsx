import React, { useState, useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCoins, FaStar, FaMagnifyingGlass, FaCircleCheck } from 'react-icons/fa6';
import { COSMETICS_CATALOG, getRingClass, getBackgroundClass, getFrameClass, getRarityColor } from '../config/cosmetics';
import type { CosmeticItem } from '../config/cosmetics';
import type { UserProfile } from '../types';
import { motion } from 'framer-motion';

export const Personalization: React.FC = () => {
  const { userProfile, token } = useAuthStore();
  const navigate = useNavigate();
  const [equippingId, setEquippingId] = useState<string | null>(null);
  const [loadingFavoriteId, setLoadingFavoriteId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Customization Tabs
  const [selectedCategory, setSelectedCategory] = useState<string>('avatar');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [favoriteOnly, setFavoriteOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('favorites');

  // Preview state (defaults to currently equipped cosmetics)
  const [previewAvatar, setPreviewAvatar] = useState<string>(userProfile?.equippedAvatar || 'programmer');
  const [previewRing, setPreviewRing] = useState<string>(userProfile?.equippedRing || '');
  const [previewFrame, setPreviewFrame] = useState<string>(userProfile?.equippedFrame || '');
  const [previewBg, setPreviewBg] = useState<string>(userProfile?.equippedBackground || '');
  const [previewTitle, setPreviewTitle] = useState<string>(userProfile?.equippedTitle || '');

  if (!userProfile) return null;

  // Dicebear Avatar generator
  const getAvatarUrl = (visual: string) => {
    if (!visual) return 'https://api.dicebear.com/7.x/adventurer/svg?seed=programmer';
    if (visual.startsWith('http')) return visual;
    if (visual === 'ai_robot' || visual === 'martian' || visual === 'robot_cat' || visual === 'cyber_dog') {
      return `https://api.dicebear.com/7.x/bottts/svg?seed=${visual}`;
    }
    if (visual === 'pixel_hero' || visual === '8bit_knight') {
      return `https://api.dicebear.com/7.x/pixel-art/svg?seed=${visual}`;
    }
    return `https://api.dicebear.com/7.x/adventurer/svg?seed=${visual}`;
  };

  // Check ownership
  const isOwned = (item: CosmeticItem) => {
    let ownedList: string[] = [];
    if (item.category === 'avatar') ownedList = userProfile.unlockedAvatars || [];
    else if (item.category === 'ring') ownedList = userProfile.unlockedRings || [];
    else if (item.category === 'frame') ownedList = userProfile.unlockedFrames || [];
    else if (item.category === 'background') ownedList = userProfile.unlockedBackgrounds || [];
    else if (item.category === 'title') ownedList = userProfile.unlockedTitles || [];
    else if (item.category === 'theme') ownedList = userProfile.unlockedThemes || [];
    else if (item.category === 'emote') ownedList = userProfile.unlockedEmotes || [];
    else if (item.category === 'sticker') ownedList = userProfile.unlockedStickers || [];
    return ownedList.includes(item.id);
  };

  // Check if item is active equipped loadout
  const isEquipped = (item: CosmeticItem) => {
    if (item.category === 'avatar') return userProfile.equippedAvatar === item.id;
    if (item.category === 'ring') return userProfile.equippedRing === item.id;
    if (item.category === 'frame') return userProfile.equippedFrame === item.id;
    if (item.category === 'background') return userProfile.equippedBackground === item.id;
    if (item.category === 'title') return userProfile.equippedTitle === item.id;
    if (item.category === 'theme') return userProfile.equippedTheme === item.id;
    return false;
  };

  // Preview an inventory item locally
  const handlePreviewItem = (item: CosmeticItem) => {
    if (item.category === 'avatar') setPreviewAvatar(item.id);
    else if (item.category === 'ring') setPreviewRing(item.id);
    else if (item.category === 'frame') setPreviewFrame(item.id);
    else if (item.category === 'background') setPreviewBg(item.id);
    else if (item.category === 'title') setPreviewTitle(item.id);
  };

  // Filter owned catalog items
  const ownedItems = useMemo(() => {
    // Only fetch items the user owns
    let items = COSMETICS_CATALOG.filter(item => item.category === selectedCategory && isOwned(item));

    // Apply name search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query));
    }

    // Apply rarity filter
    if (rarityFilter !== 'all') {
      items = items.filter(item => item.rarity === rarityFilter);
    }

    // Apply favorites filter
    if (favoriteOnly) {
      items = items.filter(item => {
        if (!userProfile.favoriteItems) return false;
        const key = `${item.category}s` as keyof typeof userProfile.favoriteItems;
        const list = userProfile.favoriteItems[key] || [];
        return list.includes(item.id);
      });
    }

    // Apply sorting
    items.sort((a, b) => {
      if (sortBy === 'favorites') {
        const getFavVal = (x: CosmeticItem) => {
          if (!userProfile.favoriteItems) return 0;
          const k = `${x.category}s` as keyof typeof userProfile.favoriteItems;
          const l = userProfile.favoriteItems[k] || [];
          return l.includes(x.id) ? 1 : 0;
        };
        return getFavVal(b) - getFavVal(a);
      }
      if (sortBy === 'newest') {
        const idxA = COSMETICS_CATALOG.findIndex(x => x.id === a.id);
        const idxB = COSMETICS_CATALOG.findIndex(x => x.id === b.id);
        return idxB - idxA;
      }
      if (sortBy === 'oldest') {
        const idxA = COSMETICS_CATALOG.findIndex(x => x.id === a.id);
        const idxB = COSMETICS_CATALOG.findIndex(x => x.id === b.id);
        return idxA - idxB;
      }
      if (sortBy === 'rarity') {
        const weights = { common: 1, rare: 2, epic: 3, legendary: 4, mythic: 5, secret: 6 };
        return weights[b.rarity] - weights[a.rarity];
      }
      if (sortBy === 'alphabetical') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    return items;
  }, [selectedCategory, searchQuery, rarityFilter, favoriteOnly, sortBy, userProfile]);

  const handleEquipItem = async (item: CosmeticItem) => {
    if (!isOwned(item)) {
      setErrorMessage("You do not own this cosmetic item!");
      return;
    }

    setEquippingId(item.id);
    setErrorMessage(null);
    setSuccessMessage(null);

    // Save previous state for rollback
    const previousProfile = { ...userProfile };

    // Perform optimistic update
    const category = item.category;
    const targetField = `equipped${category.charAt(0).toUpperCase() + category.slice(1)}` as keyof UserProfile;
    
    const updatedProfile = {
      ...userProfile,
      [targetField]: item.id
    };

    if (category === 'avatar') {
      updatedProfile.photoURL = getAvatarUrl(item.visual);
    }

    useAuthStore.setState({ userProfile: updatedProfile });

    try {
      const res = await fetch('/api/auth/profile/equip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ category: item.category, itemId: item.id })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to equip cosmetic.');
      }
      const data = await res.json();
      useAuthStore.setState({ userProfile: data.profile });
      setSuccessMessage(`${item.name} equipped successfully.`);
    } catch (err: any) {
      console.error(err);
      useAuthStore.setState({ userProfile: previousProfile });
      setErrorMessage(err.message || 'Equip operation failed.');
    } finally {
      setEquippingId(null);
    }
  };

  const handleUnequipItem = async (item: CosmeticItem) => {
    setEquippingId(item.id);
    setErrorMessage(null);
    setSuccessMessage(null);

    // Save previous state for rollback
    const previousProfile = { ...userProfile };

    // Perform optimistic update
    const category = item.category;
    const targetField = `equipped${category.charAt(0).toUpperCase() + category.slice(1)}` as keyof UserProfile;
    
    const updatedProfile = {
      ...userProfile,
      [targetField]: null
    };

    if (category === 'avatar') {
      updatedProfile.photoURL = `https://api.dicebear.com/7.x/adventurer/svg?seed=${userProfile.uid}`;
    }

    useAuthStore.setState({ userProfile: updatedProfile });

    try {
      const res = await fetch('/api/auth/profile/equip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ category: item.category, itemId: null })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to unequip cosmetic.');
      }
      const data = await res.json();
      useAuthStore.setState({ userProfile: data.profile });
      setSuccessMessage(`${item.name} unequipped successfully.`);
    } catch (err: any) {
      console.error(err);
      useAuthStore.setState({ userProfile: previousProfile });
      setErrorMessage(err.message || 'Unequip operation failed.');
    } finally {
      setEquippingId(null);
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent, item: CosmeticItem) => {
    e.stopPropagation();
    if (!isOwned(item)) {
      setErrorMessage("You cannot favorite locked cosmetics!");
      return;
    }

    setLoadingFavoriteId(item.id);
    setErrorMessage(null);
    setSuccessMessage(null);

    // Save previous state for rollback
    const previousProfile = { ...userProfile };

    // Perform optimistic update
    const favoriteItems = { ...(userProfile.favoriteItems || {}) };
    const key = `${item.category}s` as keyof typeof favoriteItems;
    let list = [...(favoriteItems[key] || [])];

    let isAdding = false;
    if (list.includes(item.id)) {
      list = list.filter((id: string) => id !== item.id);
    } else {
      list.push(item.id);
      isAdding = true;
    }
    favoriteItems[key] = list;

    const updatedProfile = {
      ...userProfile,
      favoriteItems
    };

    useAuthStore.setState({ userProfile: updatedProfile });

    try {
      const res = await fetch('/api/auth/profile/favorite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ itemId: item.id })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to toggle favorite.');
      }
      const data = await res.json();
      useAuthStore.setState({ userProfile: data.profile });
      setSuccessMessage(isAdding ? `${item.name} added to favorites.` : `${item.name} removed from favorites.`);
    } catch (err: any) {
      console.error(err);
      useAuthStore.setState({ userProfile: previousProfile });
      setErrorMessage(err.message || 'Favorite toggle failed.');
    } finally {
      setLoadingFavoriteId(null);
    }
  };

  // Resolve preview title text dynamically
  const previewTitleItem = COSMETICS_CATALOG.find(i => i.id === previewTitle);
  const displayTitle = previewTitleItem ? previewTitleItem.visual : '';

  // Resolve preview avatar seed dynamically
  const previewAvatarItem = COSMETICS_CATALOG.find(i => i.id === previewAvatar);
  const displayAvatarSeed = previewAvatarItem ? previewAvatarItem.visual : previewAvatar;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 px-4 animate-fade-in">
      
      {/* Top Header Row */}
      <div className="flex justify-between items-center bg-white/[0.01] border border-white/5 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/profile')}
            className="p-2.5 rounded-xl hover:bg-white/5 transition-all text-gray-400 hover:text-white cursor-pointer"
          >
            <FaArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-display font-black text-xl text-white uppercase tracking-wider">Locker Personalization</h2>
            <p className="text-[10px] text-gray-400 mt-0.5">Customize your public avatar, rings, frames, titles, and active themes.</p>
          </div>
        </div>

        {/* Go to Armory shortcut button */}
        <button
          onClick={() => navigate('/store')}
          className="px-4 py-2 rounded-xl bg-gradient-to-tr from-neon-purple to-neon-pink text-white font-display font-bold text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <FaCoins className="w-3.5 h-3.5" />
          <span>Go to Armory</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl border border-neon-pink/20 bg-neon-pink/5 text-xs text-neon-pink font-bold">
          ⚠️ {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl border border-neon-green/20 bg-neon-green/5 text-xs text-neon-green font-bold">
          🎉 {successMessage}
        </div>
      )}

      {/* Main Locker Grid layouts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column (4/12): Live preview loadout frame */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
          <div className="glass-panel p-5 rounded-2xl space-y-4 border border-white/10 relative overflow-hidden">
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[8px] font-black text-gray-400 uppercase tracking-widest">
              Locker Layout
            </div>
            
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-gray-400">Card Preview</h3>

            {/* Profile preview template with responsive styles */}
            <div className={`p-6 rounded-2xl shadow-xl transition-all duration-500 ${getBackgroundClass(previewBg)} ${getFrameClass(previewFrame)}`}>
              <div className="flex flex-col items-center text-center space-y-4">
                
                {/* Ring outline wrapper */}
                <div className="relative">
                  <div className={`w-24 h-24 rounded-full overflow-hidden flex items-center justify-center bg-bg-dark transition-all duration-300 ${getRingClass(previewRing)}`}>
                    <img 
                      src={getAvatarUrl(displayAvatarSeed)} 
                      alt="Preview Avatar" 
                      className="w-20 h-20 rounded-full"
                    />
                  </div>
                  <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-neon-purple text-white border-2 border-bg-dark flex items-center justify-center text-[10px] font-black leading-none">
                    {userProfile.level}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="font-display font-black text-lg text-white drop-shadow-md">{userProfile.displayName}</h4>
                  {displayTitle && (
                    <span className="inline-block px-2.5 py-0.5 rounded bg-white/10 border border-white/10 text-[9px] text-neon-cyan font-bold uppercase tracking-widest shadow">
                      {displayTitle}
                    </span>
                  )}
                </div>

                {/* Grid stats details */}
                <div className="grid grid-cols-2 gap-3 w-full pt-2 border-t border-white/5 text-left">
                  <div className="bg-black/25 p-2.5 rounded-lg border border-white/5">
                    <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest leading-none mb-1">Elo</p>
                    <p className="text-xs text-neon-cyan font-bold font-display">{userProfile.battleRating} ELO</p>
                  </div>
                  <div className="bg-black/25 p-2.5 rounded-lg border border-white/5">
                    <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest leading-none mb-1">Readiness</p>
                    <p className="text-xs text-neon-green font-bold font-display">{userProfile.placementReadinessScore}%</p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-gray-500 text-center leading-relaxed">
              Equip owned cosmetics from your locker to customize how other cadets view your profile on Leaderboards and Battle Arenas.
            </p>
          </div>
        </div>

        {/* Right column (8/12): Tabs, inventory items, filters */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Locker filter container */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            
            {/* Tab scroll horizontal bar */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory border-b border-white/5">
              {[
                { id: 'avatar', label: '🧑 Avatars' },
                { id: 'ring', label: '💍 Rings' },
                { id: 'frame', label: '🖼 Frames' },
                { id: 'background', label: '🎨 Backgrounds' },
                { id: 'title', label: '🏆 Titles' },
                { id: 'theme', label: '🌈 App Themes' },
                { id: 'emote', label: '😊 Emotes' },
                { id: 'sticker', label: '💬 Stickers' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-4 py-2.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer snap-start shrink-0 ${
                    selectedCategory === tab.id
                      ? 'bg-white/10 text-white border border-white/10 shadow'
                      : 'bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Inputs: Search owned, rarity, favorites, sort */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              
              {/* Name search query */}
              <div className="relative">
                <FaMagnifyingGlass className="absolute left-3 top-3.5 text-gray-500 w-3.5 h-3.5" />
                <input
                  type="text"
                  placeholder="Filter owned items..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-white focus:outline-none focus:border-neon-purple/50 focus:bg-neon-purple/5 transition-all duration-300"
                />
              </div>

              {/* Rarity filter selection */}
              <div>
                <select
                  value={rarityFilter}
                  onChange={e => setRarityFilter(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-bg-dark border border-white/5 text-xs text-gray-300 focus:outline-none focus:border-neon-purple/50 transition-all cursor-pointer"
                >
                  <option value="all">All Rarities</option>
                  <option value="common">Common</option>
                  <option value="rare">Rare</option>
                  <option value="epic">Epic</option>
                  <option value="legendary">Legendary</option>
                  <option value="mythic">Mythic</option>
                  <option value="secret">Secret</option>
                </select>
              </div>

              {/* Sort Selection details */}
              <div>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-bg-dark border border-white/5 text-xs text-gray-300 focus:outline-none focus:border-neon-purple/50 transition-all cursor-pointer"
                >
                  <option value="favorites">Favorites First</option>
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="rarity">Rarity</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
              </div>

              {/* Favorites toggle toggle badge button */}
              <button
                onClick={() => setFavoriteOnly(!favoriteOnly)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 ${
                  favoriteOnly
                    ? 'border-yellow-500/35 bg-yellow-500/10 text-yellow-400'
                    : 'border-white/5 bg-white/[0.02] text-gray-400 hover:text-white'
                }`}
              >
                <FaStar className={`w-3.5 h-3.5 ${favoriteOnly ? 'text-yellow-500' : 'text-gray-500'}`} />
                <span>Favorites Only</span>
              </button>
            </div>
          </div>

          {/* Grids: 2-column mobile, 4-column tablet, 6-column desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {ownedItems.map(item => {
              const active = isEquipped(item);
              const previewing = (item.category === 'avatar' && previewAvatar === item.id) ||
                                 (item.category === 'ring' && previewRing === item.id) ||
                                 (item.category === 'frame' && previewFrame === item.id) ||
                                 (item.category === 'background' && previewBg === item.id) ||
                                 (item.category === 'title' && previewTitle === item.id);

              const isFavorite = userProfile.favoriteItems &&
                                 userProfile.favoriteItems[`${item.category}s` as keyof typeof userProfile.favoriteItems]?.includes(item.id);

              const favoriteLoading = loadingFavoriteId === item.id;
              const equipLoading = equippingId === item.id;

              return (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePreviewItem(item)}
                  className={`p-4 rounded-2xl border flex flex-col justify-between gap-4 transition-all duration-300 cursor-pointer relative overflow-hidden ${
                    previewing
                      ? 'border-neon-purple bg-neon-purple/5 shadow-lg shadow-neon-purple/10'
                      : 'border-white/5 bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.02]'
                  }`}
                >
                  {/* Favorite star tag indicator */}
                  <button
                    onClick={(e) => handleToggleFavorite(e, item)}
                    disabled={favoriteLoading}
                    className="absolute top-2.5 right-2.5 z-10 text-gray-500 hover:text-yellow-400 transition-colors p-1 disabled:opacity-50 cursor-pointer"
                  >
                    {favoriteLoading ? (
                      <span className="w-3.5 h-3.5 border-2 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin block"></span>
                    ) : (
                      <FaStar className={`w-3.5 h-3.5 ${isFavorite ? 'text-yellow-400' : 'text-gray-600'}`} />
                    )}
                  </button>

                  <div className="flex flex-col items-center justify-center text-center space-y-3 pt-2">
                    
                    {/* Visual box render depending on category */}
                    <div className="w-16 h-16 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center overflow-hidden">
                      {item.category === 'avatar' && (
                        <img src={getAvatarUrl(item.visual)} alt={item.name} className="w-12 h-12 rounded-full" />
                      )}
                      {item.category === 'ring' && (
                        <div className={`w-12 h-12 rounded-full border bg-zinc-800 ${getRingClass(item.id)}`} />
                      )}
                      {item.category === 'background' && (
                        <div className={`w-12 h-12 rounded-lg border ${getBackgroundClass(item.id)}`} />
                      )}
                      {item.category === 'frame' && (
                        <div className={`w-12 h-12 border ${getFrameClass(item.id)}`} />
                      )}
                      {item.category === 'title' && (
                        <span className="text-[10px] text-neon-cyan font-bold tracking-wider uppercase border border-neon-cyan/20 px-1 py-0.5 rounded">T</span>
                      )}
                      {item.category === 'emote' && (
                        <span className="text-2xl font-bold font-display leading-none">{item.visual}</span>
                      )}
                      {item.category === 'sticker' && (
                        <span className="text-3xl font-display leading-none">{item.visual}</span>
                      )}
                      {item.category === 'theme' && (
                        <span className="text-xl font-display leading-none">🌈</span>
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <h4 className="font-display font-bold text-xs text-white truncate max-w-[130px]">{item.name}</h4>
                      <span className={`inline-block px-1.5 py-0.5 rounded border text-[7px] font-black uppercase tracking-wider ${getRarityColor(item.rarity)}`}>
                        {item.rarity}
                      </span>
                    </div>
                  </div>

                  {/* Equip triggers */}
                  <div className="pt-2 border-t border-white/5">
                    {active ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnequipItem(item);
                        }}
                        disabled={equipLoading}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-neon-green/10 border border-neon-green/20 text-neon-green hover:bg-neon-pink/10 hover:border-neon-pink/20 hover:text-neon-pink text-[9px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer"
                      >
                        {equipLoading ? (
                          <span className="w-3 h-3 border-2 border-neon-pink/20 border-t-neon-pink rounded-full animate-spin"></span>
                        ) : (
                          <>
                            <FaCircleCheck className="w-3 h-3" />
                            <span>Equipped</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEquipItem(item);
                        }}
                        disabled={equipLoading}
                        className="w-full py-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white font-display font-bold text-[9px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        {equipLoading && (
                          <span className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                        )}
                        <span>{equipLoading ? 'Equipping...' : 'Equip'}</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {ownedItems.length === 0 && (
              <div className="col-span-full py-16 text-center space-y-3 bg-white/[0.01] border border-white/5 rounded-2xl">
                <p className="text-sm text-gray-400 font-medium">No owned cosmetics found in this locker category.</p>
                <button
                  onClick={() => navigate('/store')}
                  className="px-4 py-2 rounded-xl border border-neon-purple/35 bg-neon-purple/10 text-neon-purple hover:bg-neon-purple/20 text-xs font-bold transition-all cursor-pointer"
                >
                  Browse Store for unlocks
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Personalization;
