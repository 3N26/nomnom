<p align="center">
  <img src="icon.png" alt="NomNom" width="128">
</p>

# NomNom

English | [简体中文](README.md)

A Chrome browser extension that collects and batch-opens links like a hamster. Nom nom nom... all your links.

> **Why "NomNom"?**: NomNom is an onomatopoeia for the sound of eating, often used to describe small animals (especially hamsters) munching away. This extension works like a diligent hamster, helping you "gobble up" links from web pages and stash them in tab groups to digest at your own pace.

![NomNom Demo](preview.gif)

## Features

- **Link Grouping**: Right-click a link to gather similar links from the page
- **Batch Opening**: Open links in batches to avoid tab overload
- **Keyboard Navigation**: Use shortcuts (default `Shift + →`) to quickly switch to the next link
- **Progress Tracking**: Tab group title automatically shows "visited/total" progress
- **Smart Filtering**: Option to only group unvisited links

## Installation

### From Source

1. Clone the project and install dependencies:
   ```bash
   git clone <repo-url>
   cd nomnom
   npm install
   ```

2. Build the project:
   ```bash
   npm run build
   ```

3. Load the extension:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right corner
   - Click "Load unpacked"
   - Select the `dist` directory

### Development Mode (Hot Reload)

```bash
npm run dev
```

## Usage

### Context Menu

Right-click any link on a webpage:

- **Nom links**: Collect all similar links from the page
- **Nom unvisited links**: Collect only unvisited links

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Shift + →` | Switch to next link (customizable) |

### Popup Settings

Click the extension icon to open the settings panel:

| Option | Description | Default |
|--------|-------------|---------|
| Tab Pool Count | Number of tabs to open at once | 3 |
| Next Tab Shortcut | Shortcut for switching to next link | Shift + → |
| Limit Open Links | Maximum links to collect (0 = unlimited) | 0 |
| Store Locally | Use local storage (otherwise session storage) | No |

## Project Structure

```
nomnom/
├── src/
│   ├── shared/                # Shared modules
│   │   ├── types/             # TypeScript type definitions
│   │   ├── utils/             # Utility functions
│   │   └── services/          # Shared services
│   ├── background/            # Background Service Worker
│   │   ├── services/          # Menu, tab groups, Tab Pool
│   │   └── handlers/          # Message handlers
│   ├── content/               # Content scripts
│   │   └── services/          # Link collection, hotkey listener
│   └── popup/                 # Popup UI
│       ├── components/        # UI components
│       └── styles/            # Styles
├── tests/                     # Tests
├── dist/                      # Build output
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

## Tech Stack

- **Language**: TypeScript
- **Build**: Vite + @crxjs/vite-plugin
- **Testing**: Vitest
- **Linting**: ESLint + Prettier
- **Runtime**: Chrome Extension Manifest V3
- **APIs**: Chrome Tabs, Tab Groups, History, Storage, Context Menus

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Development mode (watch for changes) |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript type checking |
| `npm run lint` | ESLint check |
| `npm run lint:fix` | ESLint auto-fix |
| `npm run format` | Prettier formatting |
| `npm run test` | Run tests |

## User Guide

### Typical Workflow

1. **Find a page with links**

   Open any page containing multiple links, such as search results, article lists, or forum posts.

2. **Collect links**

   Right-click any link in the list and select **Nom links** or **Nom unvisited links**. The extension will automatically identify all similar links on the page.

3. **Auto-open tab group**

   Once collected, the extension creates a Chrome tab group and opens the first batch of links according to your Tab Pool setting. The tab group title shows `0/N` (where N is the total number of links).

4. **Browse and navigate**

   - Browse the content in the opened tabs
   - Press the shortcut (default `Shift + →`) to jump to the next link
   - The tab group title automatically updates progress, e.g., `3/10`

5. **Auto-refill**

   When all links in the current batch are visited, the extension automatically opens the next batch from the queue until all links are visited.

### Tips

- **For many links**: Set Tab Pool Count to a smaller value (e.g., 3-5) to avoid opening too many tabs at once
- **Temporary collection**: Disable Store Locally to keep link data only in the current session
- **Skip visited**: Use Nom unvisited links to skip links already in your browser history
- **Limit quantity**: Set Limit Open Links to cap the maximum number of links collected

### Use Cases

- Batch reading search results
- Browsing forum/news lists
- Organizing bookmarked links
- Sequentially viewing multiple pages
- Reading multi-chapter articles or tutorials
- Batch viewing product details

## License

MIT
