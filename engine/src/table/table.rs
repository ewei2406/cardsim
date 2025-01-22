use crate::{
    command::{
        actions::{parse_action, Action, TableActions},
        command::Command,
    },
    game_objects::game_object::{GameObject, ObjectID},
};

pub struct Table {
    id: ObjectID,
    id_ct: ObjectID,
    objects: Vec<Box<dyn GameObject>>,
}

impl Table {
    pub fn new(id: ObjectID) -> Table {
        Table {
            id,
            id_ct: 0,
            objects: Vec::new(),
        }
    }

    pub fn get_id(&mut self) -> ObjectID {
        self.id_ct += 1;
        self.id_ct
    }

    fn remove_entity(&mut self, id: ObjectID) -> Result<(), String> {
        self.objects.retain(|o| o.id() != id);
        Ok(())
    }

    pub fn add_entity(&mut self, object: Box<dyn GameObject>) -> Result<(), String> {
        self.objects.push(object);
        Ok(())
    }

    fn execute_entity(&self, id: ObjectID, action: String) -> Result<(), String> {
        let entity = self.objects.iter().find(|o| o.id() == id);
        if let Some(object) = entity {
            object.execute(&action)?;
        }
        Ok(())
    }

    fn action(&mut self, action: String) -> Result<(), String> {
        let action = parse_action(&action)?;
        match action {
            Action::CreateDeck => TableActions::create_deck(self),
            _ => Err("Unknown action".to_string()),
        }
    }

    pub fn apply_command(&mut self, command: Command) -> Result<(), String> {
        match command {
            Command::DeleteEntity { id } => self.remove_entity(id),
            Command::ExecuteEntity { id, action } => self.execute_entity(id, action),
            Command::Action { action } => self.action(action),
        }
    }

    pub fn describe(&self) -> String {
        let mut description = format!("Table #{}\n", self.id);
        for object in &self.objects {
            description.push_str(&object.description());
            description.push_str("\n");
        }
        description
    }
}
