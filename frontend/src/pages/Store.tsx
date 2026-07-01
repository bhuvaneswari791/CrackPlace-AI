import React, { useState, useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { FaCoins, FaGift, FaMagnifyingGlass } from 'react-icons/fa6';
import { COSMETICS_CATALOG, getRingClass, getBackgroundClass, getFrameClass, getRarityColor } from '../config/cosmetics';
import type { CosmeticItem } from '../config/cosmetics';
import { motion } from 'framer-motion';

export const Store: React.FC = () => {
  const { userProfile, token } = useAuthStore();
  const [spinning, setSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<string | null>(null);
  const [openingBox, setOpeningBox] = useState(false);
  const [boxResult, setBoxResult] = useState<string | null>(null);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter and Sort states
  const [selectedCategory, setSelectedCategory] = useState<string>('avatar');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [ownershipFilter, setOwnershipFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('price_asc');

  // Preview state (defaults to equipped or welcome placeholders)
  const [previewAvatar, setPreviewAvatar] = useState<string>(userProfile?.equippedAvatar || 'programmer');
  const [previewRing, setPreviewRing] = useState<string>(userProfile?.equippedRing || '');
  const [previewFrame, setPreviewFrame] = useState<string>(userProfile?.equippedFrame || '');
  const [previewBg, setPreviewBg] = useState<string>(userProfile?.equippedBackground || '');
  const [previewTitle, setPreviewTitle] = useState<string>(userProfile?.equippedTitle || '');

  if (!userProfile) return null;

  const tzOffset = 5.5 * 60 * 60 * 1000; // IST Timezone
  const todayStr = new Date(Date.now() + tzOffset).toISOString().split('T')[0];
  const isFreeSpin = userProfile.lastSpinDate !== todayStr;

  // Dicebear API avatar resolution helper
  const getAvatarUrl = (visual: string) => {
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

  // Preview a shop item
  const handlePreviewItem = (item: CosmeticItem) => {
    if (item.category === 'avatar') setPreviewAvatar(item.id);
    else if (item.category === 'ring') setPreviewRing(item.id);
    else if (item.category === 'frame') setPreviewFrame(item.id);
    else if (item.category === 'background') setPreviewBg(item.id);
    else if (item.category === 'title') setPreviewTitle(item.id);
  };

  // Resolve preview title text dynamically
  const previewTitleItem = COSMETICS_CATALOG.find(i => i.id === previewTitle);
  const displayTitle = previewTitleItem ? previewTitleItem.visual : '';

  // Resolve preview avatar seed dynamically
  const previewAvatarItem = COSMETICS_CATALOG.find(i => i.id === previewAvatar);
  const displayAvatarSeed = previewAvatarItem ? previewAvatarItem.visual : previewAvatar;

  // Filtered store items
  const filteredItems = useMemo(() => {
    let items = COSMETICS_CATALOG.filter(item => item.category === selectedCategory);

    // Apply name search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => item.name.toLowerCase().includes(query) || item.description.toLowerCase().includes(query));
    }

    // Apply rarity filter
    if (rarityFilter !== 'all') {
      items = items.filter(item => item.rarity === rarityFilter);
    }

    // Apply ownership filter
    if (ownershipFilter !== 'all') {
      items = items.filter(item => {
        const owned = isOwned(item);
        return ownershipFilter === 'owned' ? owned : !owned;
      });
    }

    // Apply sorting
    items.sort((a, b) => {
      if (sortBy === 'price_asc') return a.cost - b.cost;
      if (sortBy === 'price_desc') return b.cost - a.cost;
      if (sortBy === 'rarity') {
        const rarityWeights = { common: 1, rare: 2, epic: 3, legendary: 4, mythic: 5, secret: 6 };
        return rarityWeights[b.rarity] - rarityWeights[a.rarity];
      }
      return a.name.localeCompare(b.name);
    });

    return items;
  }, [selectedCategory, searchQuery, rarityFilter, ownershipFilter, sortBy, userProfile]);

  const handleSpin = async () => {
    if (spinning) return;
    setSpinning(true);
    setSpinResult(null);
    setErrorMessage(null);
    setSuccessMessage(null);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const res = await fetch('/api/auth/lucky-spin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Lucky Spin failed');
      }
      const data = await res.json();
      useAuthStore.setState({ userProfile: data.profile });
      setSpinResult(data.message);
    } catch (err: any) {
      setErrorMessage(err.message || 'Spin execution failed');
    } finally {
      setSpinning(false);
    }
  };

  const handleOpenBox = async () => {
    if (openingBox) return;
    setOpeningBox(true);
    setBoxResult(null);
    setErrorMessage(null);
    setSuccessMessage(null);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      const res = await fetch('/api/auth/mystery-box/open', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to open box');
      }
      const data = await res.json();
      useAuthStore.setState({ userProfile: data.profile });
      setBoxResult(data.message);
    } catch (err: any) {
      setErrorMessage(err.message || 'Box open failed');
    } finally {
      setOpeningBox(false);
    }
  };

  const handleBuyItem = async (itemId: string) => {
    setPurchasingId(itemId);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await fetch('/api/auth/store/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ itemId })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Purchase failed');
      }
      const data = await res.json();
      useAuthStore.setState({ userProfile: data.profile });
      setSuccessMessage(data.message);
    } catch (err: any) {
      setErrorMessage(err.message || 'Store purchase failed');
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 px-4 animate-fade-in">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.01] border border-white/5 p-6 rounded-2xl">
        <div>
          <h2 className="font-display font-black text-2xl text-white uppercase tracking-wider">Cadet Armory</h2>
          <p className="text-xs text-gray-400 mt-1">Unlock premium cosmetics, loadouts, daily lucky spins, and mystery crates.</p>
        </div>

        {/* Balance displays */}
        <div className="flex gap-3 shrink-0">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-display font-bold text-xs shadow-md shadow-yellow-500/5">
            <FaCoins className="w-4 h-4 text-yellow-500 animate-bounce" style={{ animationDuration: '3s' }} />
            <span>{userProfile.coins} Coins</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neon-purple/10 border border-neon-purple/20 text-neon-purple font-display font-bold text-xs shadow-md shadow-neon-purple/5">
            <FaGift className="w-4 h-4" />
            <span>{userProfile.mysteryBoxes || 0} Boxes</span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl border border-neon-pink/20 bg-neon-pink/5 text-xs text-neon-pink font-bold animate-shake">
          ⚠️ {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl border border-neon-green/20 bg-neon-green/5 text-xs text-neon-green font-bold animate-pulse">
          🎉 {successMessage}
        </div>
      )}

      {/* Main grid section: Live preview on left, catalog filter+grid on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Col (4/12 width on desktop): Sticky Profile card live preview */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
          <div className="glass-panel p-5 rounded-2xl space-y-4 border border-white/10 relative overflow-hidden">
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[8px] font-black text-gray-400 uppercase tracking-widest">
              Live Preview
            </div>
            
            <h3 className="font-display font-bold text-xs uppercase tracking-wider text-gray-400">Loadout Preview</h3>

            {/* Simulated profile card with preview styles */}
            <div className={`p-6 rounded-2xl shadow-xl transition-all duration-500 ${getBackgroundClass(previewBg)} ${getFrameClass(previewFrame)}`}>
              <div className="flex flex-col items-center text-center space-y-4">
                
                {/* Avatar wrapper with equipped ring styles */}
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

                {/* Simulated stats */}
                <div className="grid grid-cols-2 gap-3 w-full pt-2 border-t border-white/5 text-left">
                  <div className="bg-black/25 p-2.5 rounded-lg border border-white/5">
                    <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest leading-none mb-1">Elo</p>
                    <p className="text-xs text-neon-cyan font-bold font-display">{userProfile.battleRating} ELO</p>
                  </div>
                  <div className="bg-black/25 p-2.5 rounded-lg border border-white/5">
                    <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest leading-none mb-1">Missions</p>
                    <p className="text-xs text-neon-green font-bold font-display">Active</p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-gray-500 text-center leading-relaxed">
              Tapping item thumbnails in the shop updates this preview live. Click purchase once you are satisfied with your layout.
            </p>
          </div>
        </div>

        {/* Right Col (8/12 width on desktop): Catalog filters and grid list */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Custom filters panel card */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            
            {/* Category tabs scroll */}
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
                      ? 'bg-gradient-to-tr from-neon-purple to-neon-pink text-white shadow-md shadow-neon-purple/20'
                      : 'bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Inputs: Search, Rarity, Ownership, Sorting */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              
              {/* Search text field */}
              <div className="relative">
                <FaMagnifyingGlass className="absolute left-3 top-3.5 text-gray-500 w-3.5 h-3.5" />
                <input
                  type="text"
                  placeholder="Search item..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-white focus:outline-none focus:border-neon-purple/50 focus:bg-neon-purple/5 transition-all duration-300"
                />
              </div>

              {/* Rarity selector */}
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

              {/* Ownership filter */}
              <div>
                <select
                  value={ownershipFilter}
                  onChange={e => setOwnershipFilter(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-bg-dark border border-white/5 text-xs text-gray-300 focus:outline-none focus:border-neon-purple/50 transition-all cursor-pointer"
                >
                  <option value="all">All Items</option>
                  <option value="owned">Owned Only</option>
                  <option value="locked">Locked Only</option>
                </select>
              </div>

              {/* Sorting selector */}
              <div>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-bg-dark border border-white/5 text-xs text-gray-300 focus:outline-none focus:border-neon-purple/50 transition-all cursor-pointer"
                >
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rarity">Sort by Rarity</option>
                  <option value="name">Sort by Name</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid Layout of Items: 2 cols mobile, 4 cols tablet/medium, 6 cols desktop */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map(item => {
              const owned = isOwned(item);
              const previewing = (item.category === 'avatar' && previewAvatar === item.id) ||
                                 (item.category === 'ring' && previewRing === item.id) ||
                                 (item.category === 'frame' && previewFrame === item.id) ||
                                 (item.category === 'background' && previewBg === item.id) ||
                                 (item.category === 'title' && previewTitle === item.id);

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
                  {/* Category thumbnail preview wrapper */}
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

                  {/* Pricing and Unlock Action button block */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-400 shrink-0">
                      <FaCoins className="w-3 h-3 text-yellow-500" />
                      <span>{item.cost}</span>
                    </span>

                    {owned ? (
                      <span className="px-2 py-1 rounded-lg border border-white/10 text-gray-500 text-[8px] font-bold uppercase tracking-wider">
                        Owned
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // prevent preview change
                          handleBuyItem(item.id);
                        }}
                        disabled={purchasingId !== null || userProfile.coins < item.cost}
                        className="px-3 py-1 rounded-lg bg-neon-purple hover:bg-neon-purple/80 text-white font-display font-black text-[8px] uppercase tracking-wider transition-all disabled:opacity-30 disabled:hover:bg-neon-purple cursor-pointer shadow-md shadow-neon-purple/10"
                      >
                        {purchasingId === item.id ? '...' : 'Unlock'}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {filteredItems.length === 0 && (
              <div className="col-span-full py-16 text-center space-y-2 bg-white/[0.01] border border-white/5 rounded-2xl">
                <p className="text-sm text-gray-400 font-medium">No items match your catalog filters.</p>
                <p className="text-xs text-gray-600">Try modifying search phrases or rarity options.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Spin & Crates Opener Visuals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
        
        {/* Lucky Spin Wheel card */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between items-center text-center space-y-6 relative overflow-hidden">
          <div className="space-y-2">
            <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">Lucky Wheel</h3>
            <p className="text-[11px] text-gray-500">Spin the daily wheel of fortune to win coins, XP, or boxes.</p>
          </div>

          <div className="relative w-40 h-40 flex items-center justify-center">
            <div className={`w-full h-full rounded-full border-4 border-white/10 bg-gradient-to-tr from-neon-purple to-neon-pink flex items-center justify-center shadow-lg relative ${spinning ? 'animate-spin' : ''}`}>
              <div className="absolute top-1 w-1.5 h-1.5 rounded-full bg-white"></div>
              <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-white"></div>
              <div className="absolute left-1 w-1.5 h-1.5 rounded-full bg-white"></div>
              <div className="absolute right-1 w-1.5 h-1.5 rounded-full bg-white"></div>
              <span className="font-display font-black text-white text-3xl">🎯</span>
            </div>
            <div className="absolute -top-1 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-neon-cyan filter drop-shadow"></div>
          </div>

          {spinResult && (
            <div className="p-3.5 rounded-xl border border-neon-cyan/20 bg-neon-cyan/5 text-xs font-bold text-neon-cyan animate-pulse">
              {spinResult}
            </div>
          )}

          <button
            onClick={handleSpin}
            disabled={spinning || (!isFreeSpin && userProfile.coins < 50)}
            className="w-full max-w-xs py-3 rounded-xl bg-gradient-to-r from-neon-purple to-neon-pink text-white font-display font-bold text-xs uppercase tracking-wider shadow-lg shadow-neon-purple/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            {spinning ? 'Spinning...' : isFreeSpin ? 'Free Spin of the Day' : 'Spin (50 Coins)'}
          </button>
        </div>

        {/* Mystery Box chest opener card */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between items-center text-center space-y-6 relative overflow-hidden">
          <div className="space-y-2">
            <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">Mystery Chest</h3>
            <p className="text-[11px] text-gray-500">Open active chests to secure major coin bundles, XP, or exclusive skins.</p>
          </div>

          <div className="relative w-40 h-40 flex items-center justify-center">
            <div className={`text-6xl ${openingBox ? 'animate-bounce' : 'animate-pulse'}`}>
              📦
            </div>
          </div>

          {boxResult && (
            <div className="p-3.5 rounded-xl border border-neon-green/20 bg-neon-green/5 text-xs font-bold text-neon-green animate-pulse">
              {boxResult}
            </div>
          )}

          <button
            onClick={handleOpenBox}
            disabled={openingBox || !userProfile.mysteryBoxes || userProfile.mysteryBoxes < 1}
            className="w-full max-w-xs py-3 rounded-xl bg-gradient-to-r from-neon-green to-emerald-500 text-black font-display font-bold text-xs uppercase tracking-wider shadow-lg shadow-neon-green/10 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            {openingBox ? 'Opening...' : `Open Box (${userProfile.mysteryBoxes || 0} left)`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Store;
