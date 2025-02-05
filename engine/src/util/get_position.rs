use std::collections::VecDeque;

use crate::{
    component::Position,
    constants::{MAX_X, MAX_Y, MIN_X, MIN_Y},
    gamestate::GameState,
};

pub struct NearestEmptyPosition;

fn out_of_bounds(x: i64, y: i64) -> bool {
    return x < MIN_X || x >= MAX_X || y <= MIN_Y || y > MAX_Y;
}

impl NearestEmptyPosition {
    pub fn _x_wrap(gamestate: &GameState, x: i64, y: i64, w: i64) -> Position {
        if out_of_bounds(x, y) {
            return NearestEmptyPosition::bfs(gamestate, 0, 0);
        }
        let mut x1 = x;
        let mut y1 = y;
        while gamestate
            .positions
            .get_entity_match(|e| e.x == x1 && e.y == y1)
            .is_some()
        {
            if x1 > x {
                let d = x1 - x;
                x1 = x - d;
            } else {
                let d = x - x1;
                x1 = x + d + 1;
            }
            if x1 < x - w / 2 || out_of_bounds(x1, y1) {
                x1 = x;
                y1 -= 1;
            }
        }
        if out_of_bounds(x1, y1) {
            return NearestEmptyPosition::bfs(gamestate, 0, 0);
        }
        Position { x: x1, y: y1 }
    }

    pub fn pos_x_wrap(gamestate: &GameState, x: i64, y: i64, w: i64) -> Position {
        if out_of_bounds(x, y) {
            return NearestEmptyPosition::bfs(gamestate, 0, 0);
        }
        let mut x1 = x;
        let mut y1 = y;
        while gamestate
            .positions
            .get_entity_match(|e| e.x == x1 && e.y == y1)
            .is_some()
        {
            x1 += 1;
            if x1 > x + w || out_of_bounds(x1, y1) {
                x1 = x;
                y1 -= 1;
            }
        }
        if out_of_bounds(x1, y1) {
            return NearestEmptyPosition::bfs(gamestate, 0, 0);
        }
        Position { x: x1, y: y1 }
    }

    pub fn neg_x_wrap(gamestate: &GameState, x: i64, y: i64, w: i64) -> Position {
        if out_of_bounds(x, y) {
            return NearestEmptyPosition::bfs(gamestate, 0, 0);
        }
        let mut x1 = x;
        let mut y1 = y;
        while gamestate
            .positions
            .get_entity_match(|e| e.x == x1 && e.y == y1)
            .is_some()
        {
            x1 -= 1;
            if x1 < x - w || out_of_bounds(x1, y1) {
                x1 = x;
                y1 += 1;
            }
        }
        if out_of_bounds(x1, y1) {
            return NearestEmptyPosition::bfs(gamestate, 0, 0);
        }
        Position { x: x1, y: y1 }
    }

    pub fn bfs(gamestate: &GameState, x: i64, y: i64) -> Position {
        if out_of_bounds(x, y) {
            return NearestEmptyPosition::bfs(gamestate, 0, 0);
        }
        let mut queue = VecDeque::new();
        let mut visited = std::collections::HashSet::new();

        queue.push_back((x, y));
        visited.insert((x, y));

        while let Some((cx, cy)) = queue.pop_front() {
            // Found empty spot
            if gamestate
                .positions
                .get_entity_match(|e| e.x == cx && e.y == cy)
                .is_none()
            {
                return Position { x: cx, y: cy };
            }

            // Visit neightbors
            let neighbors = vec![(cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)];

            for (nx, ny) in neighbors {
                if !out_of_bounds(nx, ny) && !visited.contains(&(nx, ny)) {
                    queue.push_back((nx, ny));
                    visited.insert((nx, ny));
                }
            }
        }

        Position { x: 0, y: 0 }
    }
}
