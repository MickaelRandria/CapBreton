# HOSSEGOR 2026

Application React mobile-first pour préparer un séjour à Hossegor et Capbreton.

## Fonctionnalités

- Itinéraire sur 3 jours
- Activités modifiables, supprimables et ajoutables
- Budget dynamique avec persistance `localStorage`
- Favoris, profil et vue carte
- Géolocalisation utilisateur sur la carte
- Itinéraire depuis la position actuelle vers une activité via OSRM
- PWA prête pour Vercel avec manifest et service worker

## Installation

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Vercel

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
