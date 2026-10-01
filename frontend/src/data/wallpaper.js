export const WALLPAPER_SECTIONS = [
  { id: "desktop", title: "Desktop" },
  { id: "abstract", title: "Abstract" },
];

export const WALLPAPERS = [
  {
    id: "sonoma-horizon",
    category: "desktop",
    label: "Sonoma Horizon",
    url: "/wallpaper/sonoma-horizon.jpg",
  },
  {
    id: "redwoods",
    category: "desktop",
    label: "Redwoods",
    url: "/wallpaper/redwoods.jpg",
  },
  {
    id: "utah-evening",
    category: "desktop",
    label: "Utah Evening",
    url: "/wallpaper/utah-evening.jpg",
  },
  {
    id: "san-francisco-bay",
    category: "desktop",
    label: "San Francisco Bay",
    url: "/wallpaper/san-francisco-bay.jpg",
  },
  {
    id: "iceland-coast",
    category: "desktop",
    label: "Iceland Coast",
    url: "/wallpaper/iceland-coast.jpg",
  },
  {
    id: "new-york-midtown",
    category: "desktop",
    label: "New York Midtown",
    url: "/wallpaper/new-york-midtown.jpg",
  },
  {
    id: "macos-graphic",
    category: "abstract",
    label: "macOS Graphic",
    url: "/wallpaper/macos-graphic.jpg",
  },
  {
    id: "radial-yellow",
    category: "abstract",
    label: "Radial Yellow",
    url: "/wallpaper/radial-yellow.jpg",
  },
  {
    id: "radial-purple",
    category: "abstract",
    label: "Radial Purple",
    url: "/wallpaper/radial-purple.jpg",
  },
  {
    id: "radial-green",
    category: "abstract",
    label: "Radial Green",
    url: "/wallpaper/radial-green.jpg",
  },
  {
    id: "radial-blue",
    category: "abstract",
    label: "Radial Blue",
    url: "/wallpaper/radial-blue.jpg",
  },
  {
    id: "ventura-light",
    category: "abstract",
    label: "Ventura",
    url: "/wallpaper/ventura-light.jpg",
  },
  {
    id: "ventura-dark",
    category: "abstract",
    label: "Ventura Dark",
    url: "/wallpaper/ventura-dark.jpg",
  },
];

export function frameStyleFromUrl(url) {
  return {
    backgroundImage: `url("${url}")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
}

export function getWallpaperById(id) {
  return WALLPAPERS.find((w) => w.id === id) ?? WALLPAPERS[0];
}
