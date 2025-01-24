use std::sync::atomic::{AtomicUsize, Ordering};

static GLOBAL_COUNTER: AtomicUsize = AtomicUsize::new(0);

pub fn get_id() -> usize {
    GLOBAL_COUNTER.fetch_add(1, Ordering::SeqCst)
}