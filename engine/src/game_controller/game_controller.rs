use crate::game_table;

use super::command;
pub fn translate_command(
    command: command::GameCommand,
    table: &game_table::GameTable,
) -> Result<Vec<game_table::GameTableUpdate>, String> {
    match command {
        command::GameCommand::MoveEntity { id, pos } => command::move_entity(table, id, pos),
        command::GameCommand::DeleteEntity { id } => command::delete_entity(id),
        command::GameCommand::MoveStack {
            depth,
            pos,
            target_pos,
        } => command::move_stack(table, depth, pos, target_pos),
        command::GameCommand::DeleteStack { depth, pos } => {
            command::delete_stack(table, depth, pos)
        }
        command::GameCommand::CreateCardsStack { pos } => command::create_cards_stack(pos),
        command::GameCommand::FlipCardsStackUp { depth, pos } => {
            command::modify_cards_stack(table, depth, pos, |x| x.facing_up = 1)
        }
        command::GameCommand::FlipCardsStackDown { depth, pos } => {
            command::modify_cards_stack(table, depth, pos, |x| x.facing_up = 0)
        }
        command::GameCommand::GatherCardsStack { pos, deck_id } => {
            command::gather_cards_stack(table, pos, deck_id)
        }
        command::GameCommand::DrawStack {
            pos,
            depth,
            hand_id,
        } => todo!(),
        command::GameCommand::PlayStack {
            ids,
            hand_id,
            facing_up,
        } => todo!(),
        command::GameCommand::ShuffleStack { pos, facing_up } => todo!(),
        command::GameCommand::CutStack {
            depth,
            pos,
            cut_pos,
            facing_up,
        } => todo!(),
        command::GameCommand::DealStack {
            pos,
            depth,
            facing_up,
        } => todo!(),
    }
}
