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

    return {
      id: String(index + 1),
      name,
      img: `/img/${encodeURIComponent(fileName)}`,
    };
  });
};