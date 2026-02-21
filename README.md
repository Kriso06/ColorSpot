# ColorSpot (MVP)

Browser game where users identify a target color in an image and receive a score out of 10 based only on RGB similarity.

## Features
- 12 static high-resolution image URLs (Picsum)
- Random target pixel color each round
- Pixel extraction via Canvas API
- Scoring formula from PRD:
  - `distance = sqrt((R1-R2)^2 + (G1-G2)^2 + (B1-B2)^2)`
  - `score = clamp(10 * (1 - distance / 441.67), 0, 10)`
- Responsive UI for desktop and mobile

## Run
Open `index.html` directly in a modern browser, or serve the folder with a static server.

Example:
- `npx serve .`

## Notes
- Images are loaded from `picsum.photos`, so internet access is required.
- Current scope matches MVP (single-player, no auth, no leaderboard).
