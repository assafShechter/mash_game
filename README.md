# MASH Game - Gelt

A modern, interactive MASH (Mansion, Apartment, Shack, House) game built with Vue 3, Vite, and TypeScript. This
application brings the classic pen-and-paper game to the web with an automated elimination process and customizable
categories.

## What is MASH?

MASH is a classic storytelling game used to predict one's future. The acronym stands for **Mansion, Apartment, Shack,
and House**, which represent the possible housing situations the player might end up in.

In this digital version, the game removes options based on a randomly selected "Magic Number" until only one option
remains in each category, revealing your "future."

## Features

- **Dynamic Categories**: Add your own custom categories beyond the classic ones.
- **Customizable Options**: Fill in as many options as you like for each category (within configurable limits).
- **Automated Elimination**: Watch the game process each category in real-time using a rhythmic elimination logic.
- **Configurable Rules**: Minimum and maximum options per category are easily adjustable via configuration.

## Tech Stack

- **Framework**: [Vue 3](https://vuejs.org/) (Composition API)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **State Management**: Reactive Controller pattern using Vue's Reactivity API.
- **Styling**: Standard CSS with a focus on usability and clean design.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (latest LTS recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

### Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd mash_game
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Run the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Building for Production

To build the project for production:

```bash
npm run build
```

The output will be in the `dist` directory.

## Future Steps / Todos

- [ ] Add sound effects for elimination steps.
- [ ] Implement a "Share Result" feature (image export or link sharing).
- [ ] Dark mode support :).
- [ ] Improve responsiveness and a bit laggy during category name insertion.
- [ ] Better color scheme.
- [ ] Add categories' suggestions.
- [ ] Make the UI a bit richer.
- [ ] Keep a history of Results and allow users to compare their results.
- [ ] Add AI logic (see the section below).

## AI integration

The game could be enhanced with AI logic that, after a few user inputs, suggests additional options.
Furthermore, it could propose random categories to make the game more engaging, introducing fresh and diverse options.
With future features such as sound effects, the game could even adapt sounds to match each option and its outcome—for
example, if the “Job” result is “Carpenter,” the sound of a hammer could play.