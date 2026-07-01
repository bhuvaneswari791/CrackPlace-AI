export interface CosmeticItem {
  id: string;
  name: string;
  category: 'avatar' | 'ring' | 'frame' | 'background' | 'title' | 'theme' | 'emote' | 'sticker';
  cost: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'secret';
  visual: string; // Dicebear seed, CSS gradient, outline style, title string, app theme identifier, etc.
  description: string;
}

export const COSMETICS_CATALOG: CosmeticItem[] = [
  // ==================== AVATARS (53 ITEMS) ====================
  { id: 'avatar_cyber_hacker', name: 'Cyber Hacker', category: 'avatar', cost: 150, rarity: 'epic', visual: 'hacker', description: 'Deep terminal shadows and cyber security overlays.' },
  { id: 'avatar_ai_robot', name: 'AI Robot', category: 'avatar', cost: 200, rarity: 'epic', visual: 'ai_robot', description: 'Autonomous humanoid droid with neural light panels.' },
  { id: 'avatar_samurai', name: 'Samurai Warrior', category: 'avatar', cost: 350, rarity: 'legendary', visual: 'samurai', description: 'Traditional armor adorned with modern neon patterns.' },
  { id: 'avatar_samurai_girl', name: 'Samurai Girl', category: 'avatar', cost: 350, rarity: 'legendary', visual: 'samurai_girl', description: 'A futuristic cybernetic swordmaster.' },
  { id: 'avatar_ninja', name: 'Ninja Spy', category: 'avatar', cost: 100, rarity: 'rare', visual: 'ninja', description: 'Strikes from the codebase undetected.' },
  { id: 'avatar_ninja_master', name: 'Ninja Master', category: 'avatar', cost: 400, rarity: 'mythic', visual: 'ninja_master', description: 'Old ninja grandmaster with legendary skills.' },
  { id: 'avatar_astronaut', name: 'Astronaut Voyager', category: 'avatar', cost: 120, rarity: 'rare', visual: 'astronaut', description: 'Ready to launch and explore empty directories.' },
  { id: 'avatar_space_cadet', name: 'Space Cadet', category: 'avatar', cost: 80, rarity: 'common', visual: 'space_cadet', description: 'An explorer cadet in search of zero gravity.' },
  { id: 'avatar_wizard', name: 'Code Wizard', category: 'avatar', cost: 250, rarity: 'epic', visual: 'wizard', description: 'Conjures working features from thin air.' },
  { id: 'avatar_dark_mage', name: 'Dark Mage', category: 'avatar', cost: 300, rarity: 'epic', visual: 'dark_mage', description: 'Wields the dark side of template metaprogramming.' },
  { id: 'avatar_knight', name: 'Cyber Knight', category: 'avatar', cost: 150, rarity: 'rare', visual: 'knight', description: 'Shields systems from stack overflows.' },
  { id: 'avatar_paladin', name: 'Royal Paladin', category: 'avatar', cost: 450, rarity: 'legendary', visual: 'paladin', description: 'A holy defender of pure functions.' },
  { id: 'avatar_viking', name: 'Viking Berserker', category: 'avatar', cost: 180, rarity: 'rare', visual: 'viking', description: 'Invades servers with brute-force scripts.' },
  { id: 'avatar_berserker', name: 'Frost Berserker', category: 'avatar', cost: 220, rarity: 'epic', visual: 'berserker', description: 'Forged in frosty regions, breaks compilers.' },
  { id: 'avatar_programmer', name: 'Senior Developer', category: 'avatar', cost: 50, rarity: 'common', visual: 'programmer', description: 'Fueled by coffee and stack trace errors.' },
  { id: 'avatar_code_monkey', name: 'Code Monkey', category: 'avatar', cost: 60, rarity: 'common', visual: 'code_monkey', description: 'Speeds through tickets at lightning speeds.' },
  { id: 'avatar_neon_gamer', name: 'Neon Gamer', category: 'avatar', cost: 180, rarity: 'rare', visual: 'neon_gamer', description: 'Loves high refresh rate monitors and RGB fans.' },
  { id: 'avatar_retro_arcade', name: 'Retro Gamer', category: 'avatar', cost: 100, rarity: 'common', visual: 'retro_arcade', description: 'Grew up on 8-bit cartridges and floppy disks.' },
  { id: 'avatar_anime_boy', name: 'Anime Protagonist', category: 'avatar', cost: 200, rarity: 'rare', visual: 'anime_boy', description: 'Always believes in the heart of the code.' },
  { id: 'avatar_anime_girl', name: 'Vibrant Gamer Girl', category: 'avatar', cost: 200, rarity: 'rare', visual: 'anime_girl', description: 'Streaming competitive MCQ rounds daily.' },
  { id: 'avatar_pixel_hero', name: 'Pixel Knight', category: 'avatar', cost: 120, rarity: 'rare', visual: 'pixel_hero', description: 'Classic adventure sprite with pixel swords.' },
  { id: 'avatar_8bit_knight', name: '8-Bit Hero', category: 'avatar', cost: 70, rarity: 'common', visual: '8bit_knight', description: 'A nostalgic retro game champion.' },
  { id: 'avatar_business_professional', name: 'Tech Recruiter', category: 'avatar', cost: 90, rarity: 'common', visual: 'recruiter', description: 'Scans resumes for keyword matches.' },
  { id: 'avatar_ceo', name: 'Venture Capitalist', category: 'avatar', cost: 250, rarity: 'epic', visual: 'ceo', description: 'Always talking about synergy and hyper-growth.' },
  { id: 'avatar_detective', name: 'Bug Detective', category: 'avatar', cost: 160, rarity: 'rare', visual: 'detective', description: 'Traces memory leaks back to their origin.' },
  { id: 'avatar_spy', name: 'Secret Agent', category: 'avatar', cost: 180, rarity: 'rare', visual: 'spy', description: 'Hides inside environment configurations.' },
  { id: 'avatar_pirate', name: 'Open Source Pirate', category: 'avatar', cost: 140, rarity: 'rare', visual: 'pirate', description: 'Sails the digital high seas copying repos.' },
  { id: 'avatar_swashbuckler', name: 'Ghost Pirate', category: 'avatar', cost: 280, rarity: 'epic', visual: 'ghost_pirate', description: 'Legendary spectral navigator.' },
  { id: 'avatar_alien', name: 'Xenomorph Coder', category: 'avatar', cost: 240, rarity: 'epic', visual: 'alien', description: 'Writes syntax that no human can understand.' },
  { id: 'avatar_martian', name: 'Martian Rover', category: 'avatar', cost: 110, rarity: 'rare', visual: 'martian', description: 'Transmits data packets from Mars.' },
  { id: 'avatar_robot_cat', name: 'Meow-bot', category: 'avatar', cost: 300, rarity: 'epic', visual: 'robot_cat', description: 'Purrs when unit tests complete successfully.' },
  { id: 'avatar_cyber_dog', name: 'Byte-dog', category: 'avatar', cost: 280, rarity: 'epic', visual: 'cyber_dog', description: 'Retrieves garbage-collected variables.' },
  { id: 'avatar_phoenix', name: 'Phoenix Reborn', category: 'avatar', cost: 500, rarity: 'legendary', visual: 'phoenix', description: 'Rises from server crashes and service outages.' },
  { id: 'avatar_dragon_rider', name: 'Dragon Tamer', category: 'avatar', cost: 600, rarity: 'mythic', visual: 'dragon_rider', description: 'Controls large data clusters with dragon breath.' },
  { id: 'avatar_shadow_warrior', name: 'Shadow Shinobi', category: 'avatar', cost: 350, rarity: 'legendary', visual: 'shadow_warrior', description: 'Master of stealth threads and background worker pools.' },
  { id: 'avatar_stealth_rogue', name: 'Stealth Rogue', category: 'avatar', cost: 220, rarity: 'epic', visual: 'stealth_rogue', description: 'Steals authorization tokens from local storage.' },
  { id: 'avatar_cyberpunk', name: 'Synthwave Runner', category: 'avatar', cost: 260, rarity: 'epic', visual: 'cyberpunk', description: 'Cruises through virtual memories.' },
  { id: 'avatar_gladiator', name: 'Arena Champion', category: 'avatar', cost: 300, rarity: 'epic', visual: 'gladiator', description: 'Undefeated 1v1 placement champion.' },
  { id: 'avatar_hacktivist', name: 'Hacktivist', category: 'avatar', cost: 180, rarity: 'rare', visual: 'hacktivist', description: 'Advocates for public domain source codes.' },
  { id: 'avatar_tech_support', name: 'Support Engineer', category: 'avatar', cost: 50, rarity: 'common', visual: 'tech_support', description: 'Asking if you have tried turning it off and on again.' },
  { id: 'avatar_bug_hunter', name: 'QA Tester', category: 'avatar', cost: 100, rarity: 'rare', visual: 'bug_hunter', description: 'Breaks flawless builds in seconds.' },
  { id: 'avatar_geek', name: 'Hardware Geek', category: 'avatar', cost: 60, rarity: 'common', visual: 'geek', description: 'Overclocks CPUs for casual quiz matches.' },
  { id: 'avatar_nerd', name: 'Math Nerd', category: 'avatar', cost: 60, rarity: 'common', visual: 'nerd', description: 'Optimizes calculations to O(log N).' },
  { id: 'avatar_coffee_addict', name: 'Espresso Lover', category: 'avatar', cost: 80, rarity: 'common', visual: 'coffee_addict', description: 'Heart rate synchronizes with server tickers.' },
  { id: 'avatar_night_owl', name: 'Midnight Coder', category: 'avatar', cost: 90, rarity: 'common', visual: 'night_owl', description: 'Writes optimal codes while others dream.' },
  { id: 'avatar_early_bird', name: 'Early Bird', category: 'avatar', cost: 80, rarity: 'common', visual: 'early_bird', description: 'Commits PRs at 5:00 AM sharp.' },
  { id: 'avatar_data_scientist', name: 'AI Researcher', category: 'avatar', cost: 240, rarity: 'epic', visual: 'data_scientist', description: 'Fits polynomial regressions in real life.' },
  { id: 'avatar_web_dev', name: 'Frontend Artisan', category: 'avatar', cost: 110, rarity: 'rare', visual: 'web_dev', description: 'Aligns divs vertically without breaking page grids.' },
  { id: 'avatar_cloud_architect', name: 'Cloud Captain', category: 'avatar', cost: 280, rarity: 'epic', visual: 'cloud_architect', description: 'Coordinates server instances across virtual clouds.' },
  { id: 'avatar_ai_engineer', name: 'Prompt Engineer', category: 'avatar', cost: 250, rarity: 'epic', visual: 'ai_engineer', description: 'Toggles temperature parameters to find responses.' },
  { id: 'avatar_quantum_coder', name: 'Quantum Dev', category: 'avatar', cost: 800, rarity: 'secret', visual: 'quantum_coder', description: 'Exists in a superposition of debug states.' },
  { id: 'avatar_security_analyst', name: 'SecOps Agent', category: 'avatar', cost: 190, rarity: 'rare', visual: 'security_analyst', description: 'Stops SQL injection scripts in their tracks.' },
  { id: 'avatar_ui_designer', name: 'UX Specialist', category: 'avatar', cost: 130, rarity: 'rare', visual: 'ui_designer', description: 'Loves soft drop shadows and clean neon glow gradients.' },

  // ==================== PROFILE RINGS (30 ITEMS) ====================
  { id: 'ring_gold', name: 'Gold Ring', category: 'ring', cost: 150, rarity: 'rare', visual: 'gold', description: 'A polished solid gold circular border.' },
  { id: 'ring_diamond', name: 'Diamond Ring', category: 'ring', cost: 350, rarity: 'legendary', visual: 'diamond', description: 'Reflects rainbow light fragments.' },
  { id: 'ring_fire', name: 'Fire Ring', category: 'ring', cost: 250, rarity: 'epic', visual: 'fire', description: 'An active circular flame trail animation.' },
  { id: 'ring_lightning', name: 'Lightning Ring', category: 'ring', cost: 280, rarity: 'epic', visual: 'lightning', description: 'Pulsing bolts of blue static electricity.' },
  { id: 'ring_galaxy', name: 'Galaxy Ring', category: 'ring', cost: 400, rarity: 'legendary', visual: 'galaxy', description: 'A rotating ring of purple-pink interstellar dust.' },
  { id: 'ring_cyber', name: 'Cyber Ring', category: 'ring', cost: 180, rarity: 'rare', visual: 'cyber', description: 'Blinking neon green circuit lanes.' },
  { id: 'ring_ice', name: 'Ice Ring', category: 'ring', cost: 160, rarity: 'rare', visual: 'ice', description: 'A frosty ring of glowing cyan ice particles.' },
  { id: 'ring_rainbow', name: 'Rainbow Ring', category: 'ring', cost: 240, rarity: 'epic', visual: 'rainbow', description: 'A revolving color wheel of spectrum shades.' },
  { id: 'ring_plasma', name: 'Plasma Ring', category: 'ring', cost: 300, rarity: 'epic', visual: 'plasma', description: 'Glowing magenta energy field arc.' },
  { id: 'ring_dark_energy', name: 'Dark Energy Ring', category: 'ring', cost: 450, rarity: 'mythic', visual: 'dark_energy', description: 'A deep vortex of pulsing dark purple shadows.' },
  { id: 'ring_holographic', name: 'Holographic Ring', category: 'ring', cost: 320, rarity: 'epic', visual: 'holographic', description: 'Opalescent white shifting reflection.' },
  { id: 'ring_legend', name: 'Legend Ring', category: 'ring', cost: 500, rarity: 'legendary', visual: 'legend', description: 'Rotating gold crowns with starry sparks.' },
  { id: 'ring_silver', name: 'Silver Ring', category: 'ring', cost: 100, rarity: 'common', visual: 'silver', description: 'Polished premium silver ring.' },
  { id: 'ring_bronze', name: 'Bronze Ring', category: 'ring', cost: 50, rarity: 'common', visual: 'bronze', description: 'Simple bronze circular frame.' },
  { id: 'ring_ruby', name: 'Ruby Ring', category: 'ring', cost: 220, rarity: 'rare', visual: 'ruby', description: 'Made of glowing crimson gemstones.' },
  { id: 'ring_emerald', name: 'Emerald Ring', category: 'ring', cost: 220, rarity: 'rare', visual: 'emerald', description: 'Bright green mineral core.' },
  { id: 'ring_sapphire', name: 'Sapphire Ring', category: 'ring', cost: 220, rarity: 'rare', visual: 'sapphire', description: 'Electric blue gemstone shine.' },
  { id: 'ring_amethyst', name: 'Amethyst Ring', category: 'ring', cost: 220, rarity: 'rare', visual: 'amethyst', description: 'Purple crystal boundary.' },
  { id: 'ring_obsidian', name: 'Obsidian Ring', category: 'ring', cost: 260, rarity: 'epic', visual: 'obsidian', description: 'Volcanic glass absorbing all reflections.' },
  { id: 'ring_neon_pink', name: 'Neon Pink', category: 'ring', cost: 120, rarity: 'common', visual: 'neon_pink', description: 'Subtle glowing hot pink outline.' },
  { id: 'ring_neon_yellow', name: 'Neon Yellow', category: 'ring', cost: 120, rarity: 'common', visual: 'neon_yellow', description: 'Blinking neon yellow border.' },
  { id: 'ring_quantum', name: 'Quantum Ring', category: 'ring', cost: 600, rarity: 'secret', visual: 'quantum', description: 'Superposition orbitals blinking on and off.' },
  { id: 'ring_solar', name: 'Solar Flare', category: 'ring', cost: 350, rarity: 'legendary', visual: 'solar', description: 'Fiery sun rays expanding outward.' },
  { id: 'ring_lunar', name: 'Lunar Eclipse', category: 'ring', cost: 300, rarity: 'epic', visual: 'lunar', description: 'Cool glowing silver crescent shade.' },
  { id: 'ring_aurora', name: 'Aurora Ring', category: 'ring', cost: 280, rarity: 'epic', visual: 'aurora', description: 'Pulsing green and violet sky wave.' },
  { id: 'ring_bubblegum', name: 'Bubblegum Ring', category: 'ring', cost: 130, rarity: 'common', visual: 'bubblegum', description: 'Cute pastel pink and sky blue stripes.' },
  { id: 'ring_matrix', name: 'Matrix Ring', category: 'ring', cost: 300, rarity: 'epic', visual: 'matrix_ring', description: 'Downward falling binary numbers around avatar.' },
  { id: 'ring_glitch', name: 'Glitch Ring', category: 'ring', cost: 280, rarity: 'epic', visual: 'glitch_ring', description: 'Intermittent static pixel displacement.' },
  { id: 'ring_pulse', name: 'Pulse Ring', category: 'ring', cost: 110, rarity: 'common', visual: 'pulse', description: 'Simple neon line expanding outwards.' },
  { id: 'ring_royal', name: 'Royal Ring', category: 'ring', cost: 450, rarity: 'mythic', visual: 'royal', description: 'Crown ornaments studded with sapphire jewels.' },

  // ==================== BACKGROUND THEMES (40 ITEMS) ====================
  { id: 'bg_galaxy', name: 'Galaxy', category: 'background', cost: 250, rarity: 'epic', visual: 'galaxy', description: 'Purple-indigo radial cosmic dust background.' },
  { id: 'bg_cyberpunk', name: 'Cyberpunk Grid', category: 'background', cost: 300, rarity: 'epic', visual: 'cyberpunk', description: 'Grid layout with neon pink and yellow splotches.' },
  { id: 'bg_coding_terminal', name: 'Coding Terminal', category: 'background', cost: 100, rarity: 'common', visual: 'terminal', description: 'Classic green monochrome console scan lines.' },
  { id: 'bg_matrix', name: 'Matrix Cascade', category: 'background', cost: 200, rarity: 'rare', visual: 'matrix', description: 'Digital rain code falling in absolute silence.' },
  { id: 'bg_ocean', name: 'Deep Ocean', category: 'background', cost: 80, rarity: 'common', visual: 'ocean', description: 'Calm deep sea navy gradient.' },
  { id: 'bg_mountains', name: 'Mountain Peaks', category: 'background', cost: 150, rarity: 'rare', visual: 'mountains', description: 'Stark geometric gray peaks on a star field.' },
  { id: 'bg_space', name: 'Space Explorer', category: 'background', cost: 120, rarity: 'common', visual: 'space', description: 'Starlight fields scattered across deep charcoal.' },
  { id: 'bg_neon', name: 'Neon Glow', category: 'background', cost: 160, rarity: 'rare', visual: 'neon', description: 'Vibrant linear gradient of cyan and magenta.' },
  { id: 'bg_forest', name: 'Emerald Forest', category: 'background', cost: 90, rarity: 'common', visual: 'forest', description: 'Soothing organic green hues.' },
  { id: 'bg_fire', name: 'Radiant Fire', category: 'background', cost: 240, rarity: 'epic', visual: 'fire', description: 'Blazing red and gold radiant gradients.' },
  { id: 'bg_ice', name: 'Glacial Ice', category: 'background', cost: 180, rarity: 'rare', visual: 'ice', description: 'Frosty absolute cyan layout.' },
  { id: 'bg_dark', name: 'AMOLED Black', category: 'background', cost: 50, rarity: 'common', visual: 'dark', description: 'Deepest possible pitch black shade.' },
  { id: 'bg_light', name: 'Minimal Light', category: 'background', cost: 50, rarity: 'common', visual: 'light', description: 'Clean off-white geometric panels.' },
  { id: 'bg_abstract', name: 'Mesh Gradient', category: 'background', cost: 140, rarity: 'rare', visual: 'abstract', description: 'Beautiful shifting organic colors.' },
  { id: 'bg_minimal', name: 'Geometric Grid', category: 'background', cost: 70, rarity: 'common', visual: 'minimal', description: 'Subtle gray border design.' },
  { id: 'bg_gaming', name: 'RGB Gamer', category: 'background', cost: 210, rarity: 'epic', visual: 'gaming', description: 'Dark violet with flashing neon corners.' },
  { id: 'bg_purple_neon', name: 'Purple Neon', category: 'background', cost: 130, rarity: 'common', visual: 'purple_neon', description: 'Vibrant purple neon ambient glow.' },
  { id: 'bg_blue_neon', name: 'Blue Neon', category: 'background', cost: 130, rarity: 'common', visual: 'blue_neon', description: 'Vibrant electric blue neon ambient glow.' },
  { id: 'bg_red_neon', name: 'Red Neon', category: 'background', cost: 130, rarity: 'common', visual: 'red_neon', description: 'Crimson linear ambient glow.' },
  { id: 'bg_aurora', name: 'Northern Lights', category: 'background', cost: 280, rarity: 'epic', visual: 'aurora', description: 'Wavy green and indigo curtains.' },
  { id: 'bg_golden', name: 'Golden Treasure', category: 'background', cost: 400, rarity: 'legendary', visual: 'golden', description: 'Rich metallic gold trim overlays.' },
  { id: 'bg_sunset', name: 'Dusk Orange', category: 'background', cost: 110, rarity: 'common', visual: 'sunset', description: 'Sunset orange merging with twilight indigo.' },
  { id: 'bg_cloud', name: 'Cloud Nine', category: 'background', cost: 100, rarity: 'common', visual: 'cloud', description: 'Soft pink and white geometric clouds.' },
  { id: 'bg_technology', name: 'Tech circuit', category: 'background', cost: 180, rarity: 'rare', visual: 'technology', description: 'Vector circuit tracings on slate background.' },
  { id: 'bg_bubblegum', name: 'Bubblegum Dream', category: 'background', cost: 150, rarity: 'common', visual: 'bubblegum', description: 'Dreamy pastel pink and sky blue gradients.' },
  { id: 'bg_lava', name: 'Lava Flow', category: 'background', cost: 220, rarity: 'epic', visual: 'lava', description: 'Bright orange cracked lava patterns.' },
  { id: 'bg_glitch', name: 'Glitch Mode', category: 'background', cost: 270, rarity: 'epic', visual: 'glitch', description: 'Static stripes with offset RGB shadows.' },
  { id: 'bg_carbon', name: 'Carbon Fiber', category: 'background', cost: 130, rarity: 'common', visual: 'carbon', description: 'Dark diagonal weave mesh.' },
  { id: 'bg_blueprint', name: 'Blueprint Grid', category: 'background', cost: 140, rarity: 'rare', visual: 'blueprint', description: 'Classic drafting grid on navy blue.' },
  { id: 'bg_sakura', name: 'Sakura Petals', category: 'background', cost: 200, rarity: 'rare', visual: 'sakura', description: 'Cherry blossom pink gradient overlays.' },
  { id: 'bg_nebula', name: 'Cosmic Nebula', category: 'background', cost: 320, rarity: 'legendary', visual: 'nebula', description: 'Gaseous space dust clouds in deep purple.' },
  { id: 'bg_stardust', name: 'Stardust Sparkle', category: 'background', cost: 190, rarity: 'rare', visual: 'stardust', description: 'Twinkling diamond particles on royal blue.' },
  { id: 'bg_abyss', name: 'Deep Abyss', category: 'background', cost: 160, rarity: 'rare', visual: 'abyss', description: 'Gradients going down to bottomless teal.' },
  { id: 'bg_matrix_rain', name: 'Code Cascade', category: 'background', cost: 220, rarity: 'epic', visual: 'matrix_rain', description: 'Cascading digital symbols in matrix terminal style.' },
  { id: 'bg_woodland', name: 'Earthy Woodland', category: 'background', cost: 100, rarity: 'common', visual: 'woodland', description: 'Organic forest brown and moss green.' },
  { id: 'bg_monochrome', name: 'Monochrome High', category: 'background', cost: 120, rarity: 'common', visual: 'monochrome', description: 'High contrast black-and-white grid lines.' },
  { id: 'bg_hologram', name: 'Reflective Hologram', category: 'background', cost: 300, rarity: 'epic', visual: 'hologram', description: 'Reflective cybernetic prism overlays.' },
  { id: 'bg_circuit', name: 'Cybernetic Mainframe', category: 'background', cost: 240, rarity: 'epic', visual: 'circuit', description: 'Motherboard connection traces with gold highlights.' },
  { id: 'bg_supernova', name: 'Supernova Blast', category: 'background', cost: 500, rarity: 'legendary', visual: 'supernova', description: 'Blazing yellow stellar core explosion.' },
  { id: 'bg_zen', name: 'Zen Garden', category: 'background', cost: 110, rarity: 'common', visual: 'zen', description: 'Subtle gray ripples resembling raked sand.' },

  // ==================== PROFILE FRAMES (30 ITEMS) ====================
  { id: 'frame_diamond', name: 'Diamond Glow', category: 'frame', cost: 350, rarity: 'legendary', visual: 'diamond', description: 'Glistening diamond borders.' },
  { id: 'frame_fire', name: 'Incinerator', category: 'frame', cost: 280, rarity: 'epic', visual: 'fire', description: 'Pulsing orange/red neon flame shadow.' },
  { id: 'frame_cyber', name: 'Cyber Grid', category: 'frame', cost: 200, rarity: 'rare', visual: 'cyber', description: 'Blinking neon green corners.' },
  { id: 'frame_legend', name: 'Crown Legend', category: 'frame', cost: 500, rarity: 'legendary', visual: 'legend', description: 'Ornate gold frame with floating crown badges.' },
  { id: 'frame_gold', name: 'Golden Trim', category: 'frame', cost: 150, rarity: 'rare', visual: 'gold', description: 'Clean polished gold outlines.' },
  { id: 'frame_silver', name: 'Sterling Silver', category: 'frame', cost: 100, rarity: 'common', visual: 'silver', description: 'Clean silver boundary lines.' },
  { id: 'frame_master', name: 'Master Coder', category: 'frame', cost: 400, rarity: 'mythic', visual: 'master', description: 'Deep purple pulsing frame.' },
  { id: 'frame_champion', name: 'Grand Champion', category: 'frame', cost: 450, rarity: 'mythic', visual: 'champion', description: 'Crimson aura border for competitive leaders.' },
  { id: 'frame_rainbow', name: 'RGB Chroma', category: 'frame', cost: 250, rarity: 'epic', visual: 'rainbow', description: 'Fading spectrum color rotation shadow.' },
  { id: 'frame_royal', name: 'Royal Velvet', category: 'frame', cost: 300, rarity: 'epic', visual: 'royal', description: 'Imperial gold frame with navy shadows.' },
  { id: 'frame_space', name: 'Nebula Portal', category: 'frame', cost: 270, rarity: 'epic', visual: 'space', description: 'Blinking white stars on cosmic violet.' },
  { id: 'frame_phoenix', name: 'Phoenix Fire', category: 'frame', cost: 420, rarity: 'legendary', visual: 'phoenix', description: 'Warm orange border that glows continuously.' },
  { id: 'frame_dragon', name: 'Dragon Scale', category: 'frame', cost: 480, rarity: 'legendary', visual: 'dragon', description: 'Patterned scales outlined in amber glow.' },
  { id: 'frame_knight', name: 'Knight Shield', category: 'frame', cost: 160, rarity: 'rare', visual: 'knight', description: 'Steel gray border plates.' },
  { id: 'frame_silicon', name: 'Silicon Grid', category: 'frame', cost: 150, rarity: 'rare', visual: 'silicon', description: 'Printed circuit board tracings.' },
  { id: 'frame_antigravity', name: 'Antigravity Glow', category: 'frame', cost: 300, rarity: 'epic', visual: 'antigravity', description: 'Outlines that fade from cyan to magenta.' },
  { id: 'frame_ai_master', name: 'Neural Master', category: 'frame', cost: 500, rarity: 'legendary', visual: 'ai_master', description: 'Glowing synapses wrapping around your card.' },
  { id: 'frame_gladiator', name: 'Arena Gladiator', category: 'frame', cost: 300, rarity: 'epic', visual: 'gladiator', description: 'Studded heavy bronze plate.' },
  { id: 'frame_shadow', name: 'Shadow Shroud', category: 'frame', cost: 260, rarity: 'epic', visual: 'shadow', description: 'Dark shadowy border smoke glow.' },
  { id: 'frame_bronze', name: 'Bronze Border', category: 'frame', cost: 50, rarity: 'common', visual: 'bronze', description: 'Simple bronze finish.' },
  { id: 'frame_platinum', name: 'Platinum Tech', category: 'frame', cost: 180, rarity: 'rare', visual: 'platinum', description: 'Sleek brushed platinum lines.' },
  { id: 'frame_grandmaster', name: 'Grandmaster Aura', category: 'frame', cost: 600, rarity: 'mythic', visual: 'grandmaster', description: 'Blinking gold-purple corona glow.' },
  { id: 'frame_elite', name: 'Elite Guardian', category: 'frame', cost: 220, rarity: 'rare', visual: 'elite', description: 'Shield markings on a forest green border.' },
  { id: 'frame_challenger', name: 'Challenger Spark', category: 'frame', cost: 380, rarity: 'epic', visual: 'challenger', description: 'Electric sparks flying from active corners.' },
  { id: 'frame_titan', name: 'Titan Core', category: 'frame', cost: 350, rarity: 'rare', visual: 'titan', description: 'Heavy iron plates with glowing cyan gaps.' },
  { id: 'frame_warlord', name: 'War Banner', category: 'frame', cost: 320, rarity: 'epic', visual: 'warlord', description: 'Jagged steel teeth with crimson drops.' },
  { id: 'frame_mystic', name: 'Mystic Runes', category: 'frame', cost: 290, rarity: 'epic', visual: 'mystic', description: 'Ancient glowing blue script letters.' },
  { id: 'frame_quantum', name: 'Quantum Matrix', category: 'frame', cost: 800, rarity: 'secret', visual: 'quantum', description: 'Superposition particle lines shifting colors.' },
  { id: 'frame_omega', name: 'Omega Core', category: 'frame', cost: 460, rarity: 'legendary', visual: 'omega', description: 'Advanced neon orange futuristic shield.' },
  { id: 'frame_alpha', name: 'Alpha Prime', category: 'frame', cost: 430, rarity: 'legendary', visual: 'alpha', description: 'Sleek white plating with golden laser guides.' },

  // ==================== PLAYER TITLES (50 ITEMS) ====================
  { id: 'title_bug_hunter', name: 'Bug Hunter', category: 'title', cost: 50, rarity: 'common', visual: 'Bug Hunter', description: 'Equips the title: "Bug Hunter".' },
  { id: 'title_code_master', name: 'Code Master', category: 'title', cost: 100, rarity: 'rare', visual: 'Code Master', description: 'Equips the title: "Code Master".' },
  { id: 'title_placement_hero', name: 'Placement Hero', category: 'title', cost: 100, rarity: 'rare', visual: 'Placement Hero', description: 'Equips the title: "Placement Hero".' },
  { id: 'title_ai_explorer', name: 'AI Explorer', category: 'title', cost: 80, rarity: 'common', visual: 'AI Explorer', description: 'Equips the title: "AI Explorer".' },
  { id: 'title_battle_champion', name: 'Battle Champion', category: 'title', cost: 150, rarity: 'rare', visual: 'Battle Champion', description: 'Equips the title: "Battle Champion".' },
  { id: 'title_quiz_king', name: 'Quiz King', category: 'title', cost: 80, rarity: 'common', visual: 'Quiz King', description: 'Equips the title: "Quiz King".' },
  { id: 'title_hr_expert', name: 'HR Expert', category: 'title', cost: 80, rarity: 'common', visual: 'HR Expert', description: 'Equips the title: "HR Expert".' },
  { id: 'title_legend', name: 'Legend', category: 'title', cost: 300, rarity: 'legendary', visual: 'Legend', description: 'Equips the title: "Legend".' },
  { id: 'title_grandmaster', name: 'Grandmaster', category: 'title', cost: 400, rarity: 'mythic', visual: 'Grandmaster', description: 'Equips the title: "Grandmaster".' },
  { id: 'title_tech_ninja', name: 'Tech Ninja', category: 'title', cost: 120, rarity: 'rare', visual: 'Tech Ninja', description: 'Equips the title: "Tech Ninja".' },
  { id: 'title_algorithm_wizard', name: 'Algorithm Wizard', category: 'title', cost: 150, rarity: 'epic', visual: 'Algorithm Wizard', description: 'Equips the title: "Algorithm Wizard".' },
  { id: 'title_full_stack_hero', name: 'Full Stack Hero', category: 'title', cost: 180, rarity: 'epic', visual: 'Full Stack Hero', description: 'Equips the title: "Full Stack Hero".' },
  { id: 'title_database_guru', name: 'Database Guru', category: 'title', cost: 110, rarity: 'rare', visual: 'Database Guru', description: 'Equips the title: "Database Guru".' },
  { id: 'title_network_king', name: 'Network King', category: 'title', cost: 110, rarity: 'rare', visual: 'Network King', description: 'Equips the title: "Network King".' },
  { id: 'title_system_architect', name: 'System Architect', category: 'title', cost: 200, rarity: 'epic', visual: 'System Architect', description: 'Equips the title: "System Architect".' },
  { id: 'title_top_recruit', name: 'Top Recruit', category: 'title', cost: 150, rarity: 'rare', visual: 'Top Recruit', description: 'Equips the title: "Top Recruit".' },
  { id: 'title_dsa_god', name: 'DSA God', category: 'title', cost: 500, rarity: 'legendary', visual: 'DSA God', description: 'Equips the title: "DSA God".' },
  { id: 'title_frontend_wizard', name: 'Frontend Wizard', category: 'title', cost: 130, rarity: 'rare', visual: 'Frontend Wizard', description: 'Equips the title: "Frontend Wizard".' },
  { id: 'title_backend_beast', name: 'Backend Beast', category: 'title', cost: 130, rarity: 'rare', visual: 'Backend Beast', description: 'Equips the title: "Backend Beast".' },
  { id: 'title_devops_ninja', name: 'DevOps Ninja', category: 'title', cost: 140, rarity: 'rare', visual: 'DevOps Ninja', description: 'Equips the title: "DevOps Ninja".' },
  { id: 'title_cloud_captain', name: 'Cloud Captain', category: 'title', cost: 160, rarity: 'rare', visual: 'Cloud Captain', description: 'Equips the title: "Cloud Captain".' },
  { id: 'title_rust_ace', name: 'Rust Ace', category: 'title', cost: 200, rarity: 'epic', visual: 'Rust Ace', description: 'Equips the title: "Rust Ace".' },
  { id: 'title_pythonista', name: 'Pythonista', category: 'title', cost: 80, rarity: 'common', visual: 'Pythonista', description: 'Equips the title: "Pythonista".' },
  { id: 'title_java_baron', name: 'Java Baron', category: 'title', cost: 90, rarity: 'common', visual: 'Java Baron', description: 'Equips the title: "Java Baron".' },
  { id: 'title_c_commander', name: 'C Commander', category: 'title', cost: 100, rarity: 'common', visual: 'C Commander', description: 'Equips the title: "C Commander".' },
  { id: 'title_git_lord', name: 'Git Lord', category: 'title', cost: 220, rarity: 'epic', visual: 'Git Lord', description: 'Equips the title: "Git Lord".' },
  { id: 'title_recursion_king', name: 'Recursion King', category: 'title', cost: 150, rarity: 'rare', visual: 'Recursion King', description: 'Equips the title: "Recursion King".' },
  { id: 'title_binary_boss', name: 'Binary Boss', category: 'title', cost: 120, rarity: 'rare', visual: 'Binary Boss', description: 'Equips the title: "Binary Boss".' },
  { id: 'title_stack_overflow', name: 'Stack Overflow', category: 'title', cost: 100, rarity: 'common', visual: 'Stack Overflow', description: 'Equips the title: "Stack Overflow".' },
  { id: 'title_coffee_powered', name: 'Coffee Powered', category: 'title', cost: 70, rarity: 'common', visual: 'Coffee Powered', description: 'Equips the title: "Coffee Powered".' },
  { id: 'title_night_coder', name: 'Night Coder', category: 'title', cost: 80, rarity: 'common', visual: 'Night Coder', description: 'Equips the title: "Night Coder".' },
  { id: 'title_speed_coder', name: 'Speed Coder', category: 'title', cost: 150, rarity: 'rare', visual: 'Speed Coder', description: 'Equips the title: "Speed Coder".' },
  { id: 'title_clean_coder', name: 'Clean Coder', category: 'title', cost: 110, rarity: 'common', visual: 'Clean Coder', description: 'Equips the title: "Clean Coder".' },
  { id: 'title_junior_dev', name: 'Junior Dev', category: 'title', cost: 40, rarity: 'common', visual: 'Junior Dev', description: 'Equips the title: "Junior Dev".' },
  { id: 'title_senior_staff', name: 'Senior Staff', category: 'title', cost: 250, rarity: 'epic', visual: 'Senior Staff', description: 'Equips the title: "Senior Staff".' },
  { id: 'title_noob', name: 'Hello World', category: 'title', cost: 30, rarity: 'common', visual: 'Hello World', description: 'Equips the title: "Hello World".' },
  { id: 'title_hacker', name: '1337 Hacker', category: 'title', cost: 200, rarity: 'epic', visual: '1337 Hacker', description: 'Equips the title: "1337 Hacker".' },
  { id: 'title_kernel_panic', name: 'Kernel Panic', category: 'title', cost: 170, rarity: 'rare', visual: 'Kernel Panic', description: 'Equips the title: "Kernel Panic".' },
  { id: 'title_overflow_king', name: 'Overflow King', category: 'title', cost: 150, rarity: 'rare', visual: 'Overflow King', description: 'Equips the title: "Overflow King".' },
  { id: 'title_null_pointer', name: 'Null Pointer', category: 'title', cost: 140, rarity: 'rare', visual: 'Null Pointer', description: 'Equips the title: "Null Pointer".' },
  { id: 'title_refactor_pro', name: 'Refactor Pro', category: 'title', cost: 160, rarity: 'rare', visual: 'Refactor Pro', description: 'Equips the title: "Refactor Pro".' },
  { id: 'title_pixel_perfect', name: 'Pixel Perfect', category: 'title', cost: 120, rarity: 'rare', visual: 'Pixel Perfect', description: 'Equips the title: "Pixel Perfect".' },
  { id: 'title_data_wizard', name: 'Data Wizard', category: 'title', cost: 180, rarity: 'epic', visual: 'Data Wizard', description: 'Equips the title: "Data Wizard".' },
  { id: 'title_regex_lord', name: 'Regex Lord', category: 'title', cost: 240, rarity: 'epic', visual: 'Regex Lord', description: 'Equips the title: "Regex Lord".' },
  { id: 'title_cyber_sentinel', name: 'Cyber Sentinel', category: 'title', cost: 260, rarity: 'epic', visual: 'Cyber Sentinel', description: 'Equips the title: "Cyber Sentinel".' },
  { id: 'title_leetcoder', name: 'LeetCoder', category: 'title', cost: 300, rarity: 'epic', visual: 'LeetCoder', description: 'Equips the title: "LeetCoder".' },
  { id: 'title_giga_chad', name: 'Giga Coder', category: 'title', cost: 500, rarity: 'legendary', visual: 'Giga Coder', description: 'Equips the title: "Giga Coder".' },
  { id: 'title_binary_searcher', name: 'Binary Searcher', category: 'title', cost: 120, rarity: 'rare', visual: 'Binary Searcher', description: 'Equips the title: "Binary Searcher".' },
  { id: 'title_constant_time', name: 'O(1) Wizard', category: 'title', cost: 350, rarity: 'legendary', visual: 'O(1) Wizard', description: 'Equips the title: "O(1) Wizard".' },
  { id: 'title_optimal_coder', name: 'Optimal Coder', category: 'title', cost: 280, rarity: 'epic', visual: 'Optimal Coder', description: 'Equips the title: "Optimal Coder".' },

  // ==================== EMOTES (6 ITEMS) ====================
  { id: 'emote_fire', name: 'Fire Blast', category: 'emote', cost: 100, rarity: 'rare', visual: '🔥', description: 'Unlocked battle emote: 🔥' },
  { id: 'emote_laugh', name: 'Laughter', category: 'emote', cost: 100, rarity: 'rare', visual: '😂', description: 'Unlocked battle emote: 😂' },
  { id: 'emote_sunglasses', name: 'Cool Face', category: 'emote', cost: 100, rarity: 'rare', visual: '😎', description: 'Unlocked battle emote: 😎' },
  { id: 'emote_gg', name: 'GG Sign', category: 'emote', cost: 150, rarity: 'epic', visual: 'GG', description: 'Unlocked battle emote: GG' },
  { id: 'emote_wp', name: 'Well Played', category: 'emote', cost: 150, rarity: 'epic', visual: 'Well Played', description: 'Unlocked battle emote: Well Played' },
  { id: 'emote_ez', name: 'Too Easy', category: 'emote', cost: 200, rarity: 'legendary', visual: 'Too Easy', description: 'Unlocked battle emote: Too Easy' },

  // ==================== CHAT STICKERS (5 ITEMS) ====================
  { id: 'sticker_programming', name: 'Programming Sticker Pack', category: 'sticker', cost: 300, rarity: 'epic', visual: '💻', description: 'Unlock the developer stickers pack.' },
  { id: 'sticker_anime', name: 'Anime Emoticons Pack', category: 'sticker', cost: 300, rarity: 'epic', visual: '🌸', description: 'Unlock the anime reaction stickers pack.' },
  { id: 'sticker_gaming', name: 'RGB Gaming Stickers', category: 'sticker', cost: 300, rarity: 'epic', visual: '🎮', description: 'Unlock the competitive gamer stickers pack.' },
  { id: 'sticker_robot', name: 'Mech Droid Stickers', category: 'sticker', cost: 300, rarity: 'epic', visual: '🤖', description: 'Unlock the robot face reactions pack.' },
  { id: 'sticker_cyber', name: 'Neon Cyber Stickers', category: 'sticker', cost: 400, rarity: 'legendary', visual: '🌐', description: 'Unlock the cyberpunk neon reactions pack.' },

  // ==================== APP THEMES (13 ITEMS) ====================
  { id: 'theme_cyberpunk', name: 'Cyberpunk Theme', category: 'theme', cost: 250, rarity: 'epic', visual: 'cyberpunk', description: 'High contrast neon pink and yellow synthwave interface.' },
  { id: 'theme_matrix', name: 'Matrix Digital', category: 'theme', cost: 200, rarity: 'rare', visual: 'matrix', description: 'Emerald digital cascade with retro terminal styling.' },
  { id: 'theme_neon_purple', name: 'Neon Purple Glow', category: 'theme', cost: 100, rarity: 'common', visual: 'neon_purple', description: 'Ambient purple glowing gasmorphism overlays.' },
  { id: 'theme_ocean_blue', name: 'Ocean Blue Theme', category: 'theme', cost: 150, rarity: 'rare', visual: 'ocean_blue', description: 'Deep calming underwater gradient backgrounds.' },
  { id: 'theme_dark_amoled', name: 'Dark AMOLED', category: 'theme', cost: 200, rarity: 'rare', visual: 'dark_amoled', description: 'Pitch black backdrop designed to maximize battery life.' },
  { id: 'theme_golden_legend', name: 'Golden Legend', category: 'theme', cost: 500, rarity: 'legendary', visual: 'golden', description: 'Metallic gold border outlines and crowns.' },
  { id: 'theme_crimson', name: 'Crimson Rage', category: 'theme', cost: 220, rarity: 'rare', visual: 'crimson', description: 'Vibrant bloody red warnings and status highlights.' },
  { id: 'theme_emerald', name: 'Emerald Forest', category: 'theme', cost: 180, rarity: 'rare', visual: 'emerald', description: 'Elegant moss green buttons and cards.' },
  { id: 'theme_space', name: 'Cosmic Space', category: 'theme', cost: 300, rarity: 'epic', visual: 'space', description: 'Pulsing starlight grid backdrops.' },
  { id: 'theme_minimal_white', name: 'Minimal White', category: 'theme', cost: 120, rarity: 'common', visual: 'minimal_white', description: 'Ultra clean geometric high contrast light design.' },
  { id: 'theme_retro', name: '8-Bit Retro', category: 'theme', cost: 160, rarity: 'rare', visual: 'retro', description: 'Chunky borders and scanline overlay templates.' },
  { id: 'theme_terminal', name: 'Developer Console', category: 'theme', cost: 180, rarity: 'rare', visual: 'terminal', description: 'Classic green-on-black console font styling.' },
  { id: 'theme_glass', name: 'Glassmorphism Pro', category: 'theme', cost: 400, rarity: 'mythic', visual: 'glass', description: 'Stunning absolute frosted glass cards and blur backdrops.' }
];

export const getRingClass = (ringId: string): string => {
  switch (ringId) {
    case 'ring_gold': return 'border-[3px] border-yellow-500 shadow-[0_0_8px_#fbbf24] animate-pulse';
    case 'ring_diamond': return 'border-[3px] border-cyan-300 shadow-[0_0_12px_#67e8f9] animate-pulse';
    case 'ring_fire': return 'border-[3px] border-red-500 shadow-[0_0_10px_#f97316] animate-bounce';
    case 'ring_lightning': return 'border-[3px] border-blue-500 shadow-[0_0_15px_#3b82f6] animate-pulse';
    case 'ring_galaxy': return 'border-[3px] border-purple-500 shadow-[0_0_15px_#ec4899] animate-pulse';
    case 'ring_cyber': return 'border-[3px] border-green-500 shadow-[0_0_10px_#22c55e]';
    case 'ring_ice': return 'border-[3px] border-sky-300 shadow-[0_0_10px_#0ea5e9]';
    case 'ring_rainbow': return 'border-[3px] border-pink-500 shadow-[0_0_12px_#3b82f6]';
    case 'ring_plasma': return 'border-[3px] border-fuchsia-500 shadow-[0_0_12px_#ec4899]';
    case 'ring_dark_energy': return 'border-[3px] border-indigo-950 shadow-[0_0_15px_#6366f1]';
    case 'ring_holographic': return 'border-[3px] border-slate-200 shadow-[0_0_12px_#f8fafc]';
    case 'ring_legend': return 'border-[3px] border-amber-500 shadow-[0_0_20px_#f59e0b]';
    case 'ring_silver': return 'border-[3px] border-slate-400 shadow-[0_0_6px_#94a3b8]';
    case 'ring_bronze': return 'border-[3px] border-amber-800 shadow-[0_0_4px_#78350f]';
    case 'ring_ruby': return 'border-[3px] border-rose-600 shadow-[0_0_8px_#f43f5e]';
    case 'ring_emerald': return 'border-[3px] border-emerald-500 shadow-[0_0_8px_#10b981]';
    case 'ring_sapphire': return 'border-[3px] border-indigo-600 shadow-[0_0_8px_#4f46e5]';
    case 'ring_amethyst': return 'border-[3px] border-purple-600 shadow-[0_0_8px_#9333ea]';
    case 'ring_obsidian': return 'border-[3px] border-stone-900 shadow-[0_0_10px_#1c1917]';
    case 'ring_neon_pink': return 'border-[3px] border-pink-400 shadow-[0_0_8px_#f472b6]';
    case 'ring_neon_yellow': return 'border-[3px] border-yellow-300 shadow-[0_0_8px_#fde047]';
    case 'ring_quantum': return 'border-[3px] border-teal-400 shadow-[0_0_15px_#2dd4bf]';
    case 'ring_solar': return 'border-[3px] border-orange-500 shadow-[0_0_15px_#f97316]';
    case 'ring_lunar': return 'border-[3px] border-slate-300 shadow-[0_0_10px_#cbd5e1]';
    case 'ring_aurora': return 'border-[3px] border-green-400 shadow-[0_0_12px_#a855f7]';
    case 'ring_bubblegum': return 'border-[3px] border-pink-300 shadow-[0_0_10px_#38bdf8]';
    case 'ring_matrix': return 'border-[3px] border-green-600 shadow-[0_0_12px_#16a34a] animate-pulse';
    case 'ring_glitch': return 'border-[3px] border-rose-500 shadow-[0_0_12px_#06b6d4]';
    case 'ring_pulse': return 'border-[3px] border-cyan-400 shadow-[0_0_8px_#0891b2]';
    case 'ring_royal': return 'border-[3px] border-violet-600 shadow-[0_0_20px_#8b5cf6] animate-pulse';
    default: return 'border-2 border-white/10';
  }
};

export const getBackgroundClass = (bgId: string): string => {
  switch (bgId) {
    case 'bg_galaxy': return 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900';
    case 'bg_cyberpunk': return 'bg-gradient-to-br from-pink-500 via-purple-600 to-yellow-400 text-black';
    case 'bg_coding_terminal': return 'bg-black border border-green-500/20 text-green-400 font-mono';
    case 'bg_matrix': return 'bg-gradient-to-b from-black to-emerald-950 text-emerald-400 font-mono';
    case 'bg_ocean': return 'bg-gradient-to-br from-blue-900 via-sky-950 to-slate-950';
    case 'bg_mountains': return 'bg-gradient-to-t from-zinc-900 to-zinc-950 border-b border-zinc-800';
    case 'bg_space': return 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-slate-950 to-black';
    case 'bg_neon': return 'bg-gradient-to-r from-cyan-500 to-blue-600';
    case 'bg_forest': return 'bg-gradient-to-b from-emerald-950 via-green-900 to-stone-950';
    case 'bg_fire': return 'bg-gradient-to-br from-red-600 via-orange-600 to-yellow-600';
    case 'bg_ice': return 'bg-gradient-to-br from-sky-400 via-cyan-500 to-blue-600';
    case 'bg_dark': return 'bg-black';
    case 'bg_light': return 'bg-slate-100 text-slate-950 border border-slate-200';
    case 'bg_abstract': return 'bg-gradient-to-tr from-pink-600 via-purple-700 to-blue-500';
    case 'bg_minimal': return 'bg-zinc-950 border border-zinc-800';
    case 'bg_gaming': return 'bg-gradient-to-tr from-violet-950 via-black to-fuchsia-950';
    case 'bg_purple_neon': return 'bg-gradient-to-br from-purple-950 via-slate-950 to-purple-950';
    case 'bg_blue_neon': return 'bg-gradient-to-br from-blue-950 via-slate-950 to-blue-950';
    case 'bg_red_neon': return 'bg-gradient-to-br from-red-950 via-slate-950 to-red-950';
    case 'bg_aurora': return 'bg-gradient-to-b from-emerald-900 via-violet-950 to-black';
    case 'bg_golden': return 'bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-700 text-black';
    case 'bg_sunset': return 'bg-gradient-to-t from-orange-500 via-red-500 to-indigo-950';
    case 'bg_cloud': return 'bg-gradient-to-b from-pink-100 to-sky-100 text-slate-800';
    case 'bg_technology': return 'bg-slate-900 border border-slate-800';
    case 'bg_bubblegum': return 'bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-400 text-black';
    case 'bg_lava': return 'bg-gradient-to-br from-red-950 via-orange-950 to-black';
    case 'bg_glitch': return 'bg-gradient-to-r from-teal-900 via-slate-950 to-rose-950';
    case 'bg_carbon': return 'bg-gradient-to-b from-stone-900 to-stone-950';
    case 'bg_blueprint': return 'bg-gradient-to-br from-blue-950 to-indigo-950 border border-blue-900/30';
    case 'bg_sakura': return 'bg-gradient-to-br from-pink-900 via-pink-950 to-black';
    case 'bg_nebula': return 'bg-gradient-to-r from-purple-900 via-indigo-950 to-blue-950';
    case 'bg_stardust': return 'bg-gradient-to-tr from-indigo-950 via-slate-900 to-black';
    case 'bg_abyss': return 'bg-gradient-to-b from-teal-950 to-black';
    case 'bg_matrix_rain': return 'bg-zinc-950 border border-green-600/20 text-green-500';
    case 'bg_woodland': return 'bg-gradient-to-br from-stone-950 to-green-950';
    case 'bg_monochrome': return 'bg-neutral-900 border border-neutral-800';
    case 'bg_hologram': return 'bg-gradient-to-tr from-cyan-900 via-slate-900 to-fuchsia-900';
    case 'bg_circuit': return 'bg-slate-950 border border-slate-800';
    case 'bg_supernova': return 'bg-gradient-to-r from-yellow-600 via-orange-600 to-red-700';
    case 'bg_zen': return 'bg-zinc-900 border border-zinc-800';
    default: return 'bg-white/[0.01] border border-white/5 text-white';
  }
};

export const getFrameClass = (frameId: string): string => {
  switch (frameId) {
    case 'frame_diamond': return 'border-4 border-cyan-300 shadow-[0_0_15px_#22d3ee] rounded-2xl';
    case 'frame_fire': return 'border-4 border-orange-500 shadow-[0_0_15px_#f97316] rounded-2xl';
    case 'frame_cyber': return 'border-4 border-green-500 shadow-[0_0_15px_#22c55e] rounded-2xl';
    case 'frame_legend': return 'border-4 border-yellow-400 shadow-[0_0_20px_#eab308] rounded-2xl';
    case 'frame_gold': return 'border-4 border-yellow-500 rounded-2xl';
    case 'frame_silver': return 'border-4 border-slate-400 rounded-2xl';
    case 'frame_master': return 'border-4 border-purple-500 shadow-[0_0_15px_#a855f7] rounded-2xl';
    case 'frame_champion': return 'border-4 border-rose-500 shadow-[0_0_15px_#f43f5e] rounded-2xl';
    case 'frame_rainbow': return 'border-4 border-pink-500 shadow-[0_0_15px_#3b82f6] rounded-2xl';
    case 'frame_royal': return 'border-4 border-violet-600 rounded-2xl';
    case 'frame_space': return 'border-4 border-indigo-900 shadow-[0_0_12px_#4f46e5] rounded-2xl';
    case 'frame_phoenix': return 'border-4 border-red-500 shadow-[0_0_20px_#ef4444] rounded-2xl';
    case 'frame_dragon': return 'border-4 border-amber-600 rounded-2xl';
    case 'frame_knight': return 'border-4 border-zinc-500 rounded-2xl';
    case 'frame_silicon': return 'border-4 border-cyan-600 rounded-2xl';
    case 'frame_antigravity': return 'border-4 border-purple-600 shadow-[0_0_15px_#ec4899] rounded-2xl';
    case 'frame_ai_master': return 'border-4 border-teal-500 shadow-[0_0_20px_#14b8a6] rounded-2xl';
    case 'frame_gladiator': return 'border-4 border-yellow-800 rounded-2xl';
    case 'frame_shadow': return 'border-4 border-neutral-900 shadow-[0_0_15px_#171717] rounded-2xl';
    case 'frame_bronze': return 'border-4 border-amber-900 rounded-2xl';
    case 'frame_platinum': return 'border-4 border-slate-300 rounded-2xl';
    case 'frame_grandmaster': return 'border-4 border-fuchsia-600 shadow-[0_0_25px_#d946ef] rounded-2xl';
    case 'frame_elite': return 'border-4 border-green-600 rounded-2xl';
    case 'frame_challenger': return 'border-4 border-sky-500 shadow-[0_0_15px_#0ea5e9] rounded-2xl';
    case 'frame_titan': return 'border-4 border-blue-900 rounded-2xl';
    case 'frame_warlord': return 'border-4 border-red-700 rounded-2xl';
    case 'frame_mystic': return 'border-4 border-indigo-500 rounded-2xl';
    case 'frame_quantum': return 'border-4 border-emerald-400 shadow-[0_0_25px_#34d399] rounded-2xl';
    case 'frame_omega': return 'border-4 border-orange-600 shadow-[0_0_20px_#ea580c] rounded-2xl';
    case 'frame_alpha': return 'border-4 border-slate-100 shadow-[0_0_20px_#ffffff] rounded-2xl';
    default: return 'border border-white/5 rounded-2xl';
  }
};

export const getRarityColor = (rarity: string): string => {
  switch (rarity) {
    case 'common': return 'text-gray-400 border-gray-500/25 bg-gray-500/5';
    case 'rare': return 'text-blue-400 border-blue-500/25 bg-blue-500/5';
    case 'epic': return 'text-purple-400 border-purple-500/25 bg-purple-500/5';
    case 'legendary': return 'text-yellow-400 border-yellow-500/25 bg-yellow-500/5';
    case 'mythic': return 'text-pink-400 border-pink-500/25 bg-pink-500/5';
    case 'secret': return 'text-cyan-400 border-cyan-500/25 bg-cyan-500/5';
    default: return 'text-gray-400 border-white/5 bg-white/5';
  }
};
