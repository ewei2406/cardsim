use super::entity::EntityId;

use std::sync::atomic::{AtomicU64, Ordering};

static COUNTER: AtomicU64 = AtomicU64::new(0);
pub fn id() -> EntityId {
    COUNTER.fetch_add(1, Ordering::Relaxed)
}
