# My Workbench

A small, scrolling portfolio site for keeping all of Astrala's projects in one
place. Dark and light themes, five accent colours, a quick-settings drawer,
project filters, and a changelog tucked into the top corner.

No frameworks, no build step, no dependencies to install. Just HTML, CSS, and
JavaScript.

## Preview it

Open `index.html` in a browser. That's it.

If you'd rather run a local server (handy for testing on your phone):

```powershell
npx serve .
```

or:

```powershell
python -m http.server 8000
```

## Files

| File | What it does |
| --- | --- |
| `index.html` | Page structure and static copy |
| `styles.css` | All styling, themes, and responsive rules |
| `data.js` | **Your projects, changelog, and site details** |
| `app.js` | Filtering, theme settings, panels, scroll effects |
| `favicon.svg` | The little purple "W" in the browser tab |

## Making it yours

Most day-to-day editing happens in `data.js`.

### Site details

```js
window.WORKBENCH_SITE = {
  name: "Astrala",
  updated: "November 2026"
};
```

### Projects

Add an object to `WORKBENCH_PROJECTS`:

```js
{
  title: "My New Project",
  status: "In progress",       // "In progress", "Planned", or "Shipped"
  category: "Web app",
  icon: "layout",              // gamepad, pickaxe, layout, bot, palette, cloud
  description: "A sentence or two about it.",
  year: "2026",
  link: "https://example.com"  // optional — adds an "Open" link
}
```

The counts at the top, the filters, and the "Showing x of y" label all update
automatically. Only statuses that currently have a project get a filter chip, so
the row stays tidy as the list changes. If you use an icon name that doesn't
exist, a cube is used as a fallback.

### Changelog

`WORKBENCH_CHANGELOG` is newest-first. The first entry is labelled **Latest**,
and an unread dot appears next to the Changelog button until the panel has been
opened once on that device.

### Copy

The greeting, headline, and paragraphs live in `index.html`. Search for
"workbench" if you want to change the wording.

## Themes

Settings are saved to `localStorage` under `workbench.settings`, so each
visitor's choice stays on their device.

- **Theme:** Dark, Light, or follow the system
- **Accent:** Violet, Blue, Teal, Rose, or Amber
- **Reduce motion:** turns off reveals, hover lifts, and panel transitions

Accent colours are defined near the top of `styles.css`. To add another, copy
one of the `[data-accent="..."]` rules, add the matching colour to the
`ACCENT_NAMES` map and swatch markup in `app.js` / `index.html`.

## Deploying

Because it's entirely static, GitHub Pages works without any configuration:
push these files to a repository, then set **Settings → Pages → Deploy from a
branch** to the root of your default branch. Netlify Drop, Cloudflare Pages, or
any static host will work the same way.

## Accessibility notes

- Home/Projects links and the skip link are keyboard accessible
- Panels trap focus, close with Escape, and return focus to where you were
- All theme and accent choices are real buttons with pressed/checked states
- Motion respects both the in-page toggle and `prefers-reduced-motion`
