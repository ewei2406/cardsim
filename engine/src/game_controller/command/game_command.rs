use crate::entity::{EntityId, EntityPosition};

pub enum GameCommand {
    MoveEntity {
        id: EntityId,
        pos: EntityPosition,
    },
    DeleteEntity {
        id: EntityId,
    },
    CreateCardsStack {
        pos: EntityPosition,
    },
    MoveStack {
        depth: u64,
        pos: EntityPosition,
        target_pos: EntityPosition,
    },
    DeleteStack {
        depth: u64,
        pos: EntityPosition,
    },
    FlipCardsStackUp {
        depth: u64,
        pos: EntityPosition,
    },
    FlipCardsStackDown {
        depth: u64,
        pos: EntityPosition,
    },
    GatherCardsStack {
        pos: EntityPosition,
        deck_id: EntityId,
    },
    DrawStack {
        pos: EntityPosition,
        depth: u64,
        hand_id: EntityId,
    },
    PlayStack {
        ids: Vec<EntityId>,
        hand_id: EntityId,
        facing_up: u8,
    },
    ShuffleStack {
        pos: EntityPosition,
        facing_up: u8,
    },
    CutStack {
        depth: u64,
        pos: EntityPosition,
        cut_pos: EntityPosition,
        facing_up: u8,
    },
    DealStack {
        pos: EntityPosition,
        depth: u64,
        facing_up: u8,
    },
}
