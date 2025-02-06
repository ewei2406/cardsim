FROM rust:latest

# Dependency layer
WORKDIR /usr/src/app
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release && rm -rf src/main.rs

# Build the app
COPY . .
RUN cargo build --release

# Run it
ENV RUST_LOG=info
ENV ENGINE_PORT=3000
EXPOSE 3000
CMD ["./target/release/engine"]