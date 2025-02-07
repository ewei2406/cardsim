ARG RUST_VERSION=1.81.0
FROM rust:${RUST_VERSION}-slim-bullseye AS build-backend
WORKDIR /app

# Cache dependencies
COPY engine/Cargo.toml engine/Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo fetch
RUN cargo build --release
RUN rm -rf src/main.rs

# Copy the actual source code and build
COPY engine/src ./src/
RUN touch src/main.rs
RUN cargo build --release

# Move the compiled binary to /bin
RUN mv ./target/release/engine /bin/server

FROM node:20-alpine AS build-frontend
WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

FROM debian:bullseye-slim AS runtime

ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser
USER appuser

COPY --from=build-backend /bin/server /bin/
COPY --from=build-frontend /app/dist /bin/dist

EXPOSE 8080
ENV PORT=8080
ENV HOST=0.0.0.0
ENV RUST_LOG=debug
WORKDIR /bin
CMD ["./server"]
