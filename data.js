/* ------------------------------------------------------------------
   Your content lives here. Edit this file to make the site yours.
   Refresh the page after saving — there is no build step.
   ------------------------------------------------------------------ */

window.WORKBENCH_SITE = {
  name: "Lucas",
  updated: "November 2026",
  footerNote: "Built by hand, one section at a time."
};

/* status: "In progress" | "Planned" | "Shipped"
   icon:   "gamepad" | "pickaxe" | "layout" | "bot" | "palette" | "cloud"
   link:   optional URL — adds an "Open" link to the card footer        */
window.WORKBENCH_PROJECTS = [
  {
    title: "Video Game Launcher",
    status: "Planned",
    category: "Desktop app",
    icon: "gamepad",
    description: "One place to open all of my games, with a simple library and play times.",
    year: "2026"
  },
  {
    title: "Minecraft Client",
    status: "Planned",
    category: "Game client",
    icon: "pickaxe",
    description: "My own Minecraft client with the settings and features I actually want.",
    year: "2026"
  },
  {
    title: "This Workbench",
    status: "In progress",
    category: "Website",
    icon: "layout",
    description: "The site you’re looking at — a home for every project and every half-formed idea.",
    year: "2026"
  },
  {
    title: "Discord Bot",
    status: "In progress",
    category: "Bot",
    icon: "bot",
    description: "A small helper for my servers: a few handy commands and a lot of tinkering.",
    year: "2025"
  },
  {
    title: "Pixel Art Studio",
    status: "Planned",
    category: "Web app",
    icon: "palette",
    description: "A tiny browser tool for drawing sprites, palettes, and simple animations.",
    year: "2026"
  },
  {
    title: "Weather Dashboard",
    status: "Shipped",
    category: "Web app",
    icon: "cloud",
    description: "A calm little dashboard for the forecast, built to learn a new weather API.",
    year: "2025"
  }
];

/* Newest first. The first entry is marked “Latest” in the panel. */
window.WORKBENCH_CHANGELOG = [
  {
    version: "1.0.0",
    date: "Nov 19, 2026",
    title: "The workbench opens",
    items: [
      "A scrolling home for every project, finished or not.",
      "Dark, light, and system themes with five accent colors.",
      "Project filters, quick settings, and a changelog in the corner."
    ]
  },
  {
    version: "0.9.0",
    date: "Nov 12, 2026",
    title: "A first sketch",
    items: [
      "Early layout and a first pass at the project cards.",
      "A simple two-column grid to test the idea."
    ]
  }
];

window.WORKBENCH_UP_NEXT = [
  "A detail page for each project",
  "Search across the whole workbench",
  "A proper about page — when I get around to it"
];
