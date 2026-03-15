# StreamByte

StreamByte is a modern, premium movie and series streaming web application built with React (Next.js 14+), TypeScript, and Tailwind CSS. It integrates with the Stremio Addon Protocol to provide a decentralized and highly customizable streaming experience.

![StreamByte HUD](/public/icon-512.png)

## 🚀 Features

- **Stremio Addon Support**: Seamless integration with the Stremio Addon Protocol (v3).
- **Multi-Addon Aggregation**: Live, concurrent search across all installed addons.
- **Dynamic Resolver**: Automatically resolves streams with quality detection (4K, 1080p, 720p, SD).
- **Premium HUD Design**: Ultra-dark design with glassmorphism, HUD elements, and smooth animations.
- **Smart History & Watchlist**: Track your progress and save your favorites with full metadata persistence.
- **Native PWA**: Installable on mobile and desktop for a native application feel.
- **Resilient Architecture**: Built with Zustand for state management and React Query for reliable data fetching with exponential backoff.

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Video Player**: ReactPlayer with HLS support
- **Icons**: Lucide React

## 📦 Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/streambyte.git
   cd streambyte
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Stremio Addon SDK](https://github.com/Stremio/stremio-addon-sdk) for the protocol specification.
- [Cinemeta](https://v3-cinemeta.strem.io) for the default metadata provider.
