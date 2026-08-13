import siteConfig from '../../site.config.json'

interface SiteConfig {
  marketName: string;
  landingTitle: string;
  priceDelivered: number;
  logo: string;
  favicon: string;
  colors: {
    primary: string;
    secondary: string;
    tertiary: string;
    border: string;
    success: string;
    error: string;
    warning: string;
    primarytext: string;
    secondarytext: string;
    tertiarytext: string;
  };
  imageName: {
    burger: string;
    burgerCat: string;
    Cheese: string;
    drink: string;
    lettuce: string;
    'mushroom-2': string;
    mushroom: string;
    others: string;
    pasta: string;
    pish: string;
    pizza: string;
    sandwich: string;
    vegetable: string;
    [key: string]: string;
  };
}

export const getImageList = async () => {
  // Electron
  if (window.electronAPI?.getImages) {
    return await window.electronAPI.getImages();
  }

  // Web
  const images = import.meta.glob('/public/img/*.{png,jpg,jpeg,gif,svg,webp}', {
    eager: true,
    import: 'default',
  });

  return Object.entries(images).map(([filePath], index) => {
    const fileName = filePath.split('/').pop() || '';
    const name = fileName.replace(/\.[^.]+$/, '');

    const persianName = (siteConfig as SiteConfig).imageName[name] || name;

    return {
      id: String(index + 1),
      name: persianName,
      img: `/img/${encodeURIComponent(fileName)}`,
    };
  });
};