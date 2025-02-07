# Simple Card Simulator

An application for playing simple card games online.

Play here now: https://cards.edwardwei.com

## Development

### Backend

> Prereq: `rust 18.x`

- Enter the backend directory: `cd engine`
- Start the backend: `RUST_LOG=debug cargo run`
  - This will start on port `8080` by default. Specify ports, host, and log level with env vars. Ex: `PORT=1234 HOST=127.0.0.1 RUST_LOG=info`

#### Notes

- The endpoint `/healthz` is exposed for health checks by kubernetes.
- The backend will serve the directory `dist` at `/`. This is not necessary for local development.

### Frontend

> Prereq: `node 20.x`

- Enter the frontend directory: `cd frontend`
- Install dependencies: `npm i`
- Start the local development server: `npm run dev`

## Building for Deployment

> Prereq: `docker`

- Build the docker image: `docker build -t <your-tag-name> .`
- Start the image: `docker run -p 8080:8080 <your-tag-name>`
  - This will map the container port `8080` (default app port) to your host machine's port.
