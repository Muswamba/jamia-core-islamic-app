import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage, STORAGE_KEYS } from '../storage';
import { FontSize, Typography, getTypography } from './typography';

// Re-export FontSize for convenience
export type { FontSize } from './typography';

interface FontScaleContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => Promise<void>;
  typography: Typography;
}

const FontScaleContext = createContext<FontScaleContextType | undefined>(undefined);

export const useFontScale = () => {
  const context = useContext(FontScaleContext);
  if (!context) {
    throw new Error('useFontScale must be used within FontScaleProvider');
  }
  return context;
};

interface FontScaleProviderProps {
  children: ReactNode;
}

export const FontScaleProvider: React.FC<FontScaleProviderProps> = ({ children }) => {
  const [fontSize, setFontSizeState] = useState<FontSize>('system');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    loadFontSize();
  }, []);

  const loadFontSize = async () => {
    try {
      const stored = await storage.get<FontSize>(STORAGE_KEYS.FONT_SIZE);
      if (stored) {
        setFontSizeState(stored);
      }
    } catch (error) {
      console.error('Error loading font size:', error);
    } finally {
      setIsReady(true);
    }
  };

  const setFontSize = async (size: FontSize) => {
    try {
      await storage.set(STORAGE_KEYS.FONT_SIZE, size);
      setFontSizeState(size);
    } catch (error) {
      console.error('Error saving font size:', error);
    }
  };

  const typography = getTypography(fontSize);

  // Don't block rendering - use default font size if not ready
  const value: FontScaleContextType = {
    fontSize,
    setFontSize,
    typography,
  };

  return <FontScaleContext.Provider value={value}>{children}</FontScaleContext.Provider>;
};
