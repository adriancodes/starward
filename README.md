# Orbit — A Solar System Observatory

An interactive 3D observatory for exploring the Sun, all eight planets, Earth's Moon, and our motion through the Milky Way. Built with JavaScript and Three.js, with bundled planetary textures and fonts.

**No build step, package installation, API keys, or backend are required.** The `dist/` directory contains the complete web app and its editable source. It is intentionally committed to this repository.

## Run locally

You need Git, Python 3, and a modern browser with WebGL 2 and hardware acceleration enabled. Python only serves the files during local development; it is not part of the deployed app.

```sh
git clone https://github.com/adriancodes/orbit-solar-observatory.git
cd orbit-solar-observatory
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

Open **http://127.0.0.1:4173/** in your browser. Keep the terminal open while using the app, and press **Ctrl+C** to stop the server.

On Windows, replace the last command with:

```powershell
py -3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

You can also download this repository as a ZIP, extract it, and run the server command from the extracted folder. Any static HTTP server can serve `dist/`; opening `index.html` directly with a `file://` URL will not work reliably because the app uses JavaScript modules.

## Deploy as a web app

Import this GitHub repository into a static web host. Use the repository root as the project/base directory and **`dist` as the publish/output directory**. No environment variables or install command are needed.

| Host | Framework preset | Build command | Publish/output directory |
| --- | --- | --- | --- |
| Cloudflare Pages | None | `exit 0` | `dist` |
| Netlify | No framework | Leave empty | `dist` |
| Vercel | Other | Enable the build-command override and leave it empty | Override to `dist` |

Select `main` as the production branch. After importing the repository, save these settings and deploy. Once Git-based deployments are enabled, subsequent pushes to `main` can update your site automatically.

Provider instructions: [Cloudflare static HTML](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/), [Netlify build settings](https://docs.netlify.com/build/configure-builds/overview/), and [Vercel static builds](https://vercel.com/docs/builds/configure-a-build).

For another web server, copy the **contents of `dist/`** into its public web directory, preserving the `assets/` and `vendor/` folders. Serve JavaScript `.js` and `.mjs` files with a JavaScript MIME type, and use HTTPS for a public deployment. Python's development server is not the production hosting setup.

## Explore

- **Earth & Moon:** follow Earth and its orbiting Moon.
- **Solar system:** see the Sun and all eight planetary orbits.
- **Galactic voyage → Solar trails:** follow the Solar System's recent path.
- **Galactic voyage → Milky Way:** see the Solar System orbit the galaxy.
- **Galactic voyage → Through space:** see the galaxy drift through a larger reference frame. Follow the galaxy, follow the Solar System, or use a fixed camera.
- **Planet strip:** select a body for a close-up and its facts.
- **Display settings → Physical scale:** use proportional body sizes and distances. The default view enlarges planets and compresses distances for visibility.

Drag to orbit the camera; scroll or pinch to zoom. The controls support pause, forward/reverse time, speed changes, and dates within 1800–2050. Galactic views have a separate clock in millions of years, preserving the planetary date when you switch back.

| Shortcut | Action |
| --- | --- |
| Space | Pause or resume the simulation |
| R | Reset the camera |
| O | Toggle orbit paths |
| L | Toggle labels |

## Soundtrack

The **Soundtrack** button opens Spotify's official *Interstellar* album player. It loads after a click; press play inside the player to start listening. Closing it stops the music. Spotify may offer only previews depending on the browser and listening context; the panel also links to the album on Spotify.

The actual recordings are **not bundled** with this repository. A separate continuous background-audio mode is not implemented yet; adding it is pending a soundtrack file cleared for use on the website. The simulation itself does not require Spotify or an internet connection once its local files are served.

## Edit the app

Edit the files in `dist/`, then reload your browser. There is no generated build to regenerate.

```text
dist/
  index.html             Page layout, controls, and module imports
  style.css              Styling and responsive layouts
  app.js                 Solar-system rendering and interaction
  orbits.mjs             Planetary data and Keplerian orbital calculations
  galaxy.js              Milky Way visualization
  galactic-motion.mjs    Solar galactic orbit and bulk-motion calculations
  soundtrack.js          Optional Spotify player lifecycle
  assets/                Planet maps, fonts, and attribution files
  vendor/                Three.js, OrbitControls, and their license
check-orbits.mjs          Orbital and galactic-motion checks
check-soundtrack.mjs      Soundtrack control checks
```

## Run the checks

With Node.js installed, run these from the repository root. No npm packages are needed:

```sh
node check-orbits.mjs
node check-soundtrack.mjs
```

The checks cover Kepler residuals, orbital geometry, Earth–Moon barycenter conservation, lunar distances, galactic orbital closure, nested motion, drift units, reversal, invalid galactic input, and the soundtrack player's opt-in/stop/reopen behavior. Soundtrack checks do not contact Spotify or verify authenticated audio playback.

## Scientific model and limits

- Planet positions use [NASA/JPL approximate Keplerian elements](https://ssd.jpl.nasa.gov/planets/approx_pos.html) for 1800–2050. The Moon uses a simplified precessing ellipse based on [Paul Schlyter's model](https://stjarnhimlen.se/comp/ppcomp.html), with an Earth–Moon barycenter correction.
- Physical scale preserves size and distance ratios. Surface orientation, atmospheric effects, illumination adjustments, and the star field are illustrative. Enhanced scale intentionally changes visual proportions.
- Solar trails show the previous 540 days using a local straight-line approximation at 200 km/s.
- The galactic views use a separate ±500-million-year clock, a Solar System marker 26,700 light-years from the center, and an approximate 230-million-year circular orbit. The barred spiral is a statistical illustration, not a mapped star catalog; markers are enlarged.
- Through space uses a constant 620 km/s Local Group bulk velocity relative to the cosmic microwave background, toward Galactic longitude 271.9° and latitude 29.6° ([PDG reference, §29.2](https://pdgweb.lbl.gov/2023/reviews/rpp2023-rev-cosmic-microwave-background.pdf)). This is a proxy for the Milky Way's bulk motion, not its exact individual velocity or an absolute rest frame.
- This is an educational visualization, not an N-body gravity simulation or a precision ephemeris. The model omits intergalactic gravity, cosmic expansion, and future structural evolution.

An optional browser WebMCP integration is feature-detected; ordinary use does not require it. Native WebMCP execution was not verified in the test browser.

## Troubleshooting

- **A directory listing or 404 appears:** point the server or host's publish directory at `dist`, not the repository root.
- **The 3D view cannot start:** enable hardware acceleration and use a WebGL 2-capable browser/device.
- **Modules fail to load:** use HTTP/HTTPS rather than opening the HTML file directly, and check `.js`/`.mjs` MIME types on your host.
- **Planets appear tiny:** Physical scale is enabled. Select a planet for a close-up or switch back to enhanced scale.
- **Spotify only plays a short preview:** use the panel's Spotify link. The streaming service controls playback availability.

## Credits

- Planet textures: [Solar System Scope / INOVE](https://www.solarsystemscope.com/textures/), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). See [texture attribution](dist/assets/ATTRIBUTION.md); preserve credit and identify any changes when redistributing modified textures.
- Three.js and OrbitControls: MIT; [bundled license](dist/vendor/THREE-LICENSE.txt).
- DM Sans: [SIL Open Font License](dist/assets/DM-Sans-LICENSE.txt).
- Space Grotesk: [SIL Open Font License](dist/assets/Space-Grotesk-LICENSE.txt).
- *Interstellar* soundtrack: Hans Zimmer, streamed through Spotify. Music rights are not included with the app.

Third-party assets retain their respective licenses.
