FROM alpine:latest
CMD ["echo", "Hello, World!"]

# ARG RUST_VERSION=1.81.0
# FROM rust:${RUST_VERSION}-slim-bullseye AS build-backend
# WORKDIR /app

# RUN --mount=type=bind,source=engine/src,target=src \
#     --mount=type=bind,source=engine/Cargo.toml,target=Cargo.toml \
#     --mount=type=bind,source=engine/Cargo.lock,target=Cargo.lock \
#     --mount=type=cache,target=/app/target/ \
#     --mount=type=cache,target=/usr/local/cargo/registry/ \
#     <<EOF
# set -e
# cargo build --locked --release
# cp ./target/release/engine /bin/server
# EOF

# FROM node:20-alpine AS build-frontend
# WORKDIR /app

# COPY frontend/package.json frontend/package-lock.json ./
# RUN npm install

# COPY frontend/ ./
# RUN npm run build

# FROM debian:bullseye-slim AS runtime

# ARG UID=10001
# RUN adduser \
#     --disabled-password \
#     --gecos "" \
#     --home "/nonexistent" \
#     --shell "/sbin/nologin" \
#     --no-create-home \
#     --uid "${UID}" \
#     appuser
# USER appuser

# COPY --from=build-backend /bin/server /bin/
# COPY --from=build-frontend /app/dist /bin/dist

# EXPOSE 8080
# ENV PORT=8080
# ENV HOST=0.0.0.0
# ENV RUST_LOG=debug
# WORKDIR /bin
# CMD ["./server"]
