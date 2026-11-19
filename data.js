/* ------------------------------------------------------------------
   Your content lives here. Edit this file to make the site yours.
   Refresh the page after saving — there is no build step.
   ------------------------------------------------------------------ */

window.WORKBENCH_SITE = {
  name: "Astrala",
  updated: "November 2026"
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
  }
];

/* Newest first. The first entry is marked “Latest” in the panel. */
window.WORKBENCH_CHANGELOG = [
  {
    version: "1.1.0",
    date: "Nov 19, 2026",
    title: "A tighter workbench",
    items: [
      "Renamed the workbench owner to Astrala.",
      "Trimmed the list to the Video Game Launcher and Minecraft Client — the Discord bot, pixel art studio, weather dashboard, and placeholder workbench are gone.",
      "Cleared out the v0.9.0 note, the “Next up” block, and the footer tagline."
    ]
  },
  {
    version: "1.0.0",
    date: "Nov 19, 2026",
    title: "The workbench opens",
    items: [
      "A scrolling home for every project, finished or not.",
      "Dark, light, and system themes with five accent colors.",
      "Project filters, quick settings, and a changelog in the corner."
    ]
  }
];
