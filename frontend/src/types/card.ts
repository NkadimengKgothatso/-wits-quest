export type CardRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';
export type CardCategory = 'Science' | 'History' | 'Landmarks' | 'Lifestyle' | 'Sports';

export interface CardStats {
  attack: number;
  defense: number;
  speed: number;
  brains: number;
}

export interface Card {
  id: string;
  name: string;
  category: CardCategory;
  rarity: CardRarity;
  stats: CardStats;
  image: string;
}
