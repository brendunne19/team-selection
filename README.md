# County Selection Board

A React + Vite selection board based on `docs/context/idea.md` and the sample roster in `sample_player_data.md`.

## Run locally

```sh
npm install
npm run dev
```

The board starts from the sample roster and stores squad assignments in browser local storage. `minTeam` is used as each player's team rank floor; unavailable sample players cannot be assigned. The sample file does not include weekend lock history, so that warning is not represented. Database/authentication and automated data sync are not part of this frontend implementation.

## Hosting on GitHub Pages

The included GitHub Actions workflow builds the Vite app and deploys it to Pages when changes reach `main`. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**. The Vite base path is configured for this repository name.
