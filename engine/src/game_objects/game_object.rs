pub trait GameObject {
    fn id(&self) -> u32;
    fn description(&self) -> String;
    fn execute(&self, action: &str) -> Result<(), String>;
}

pub type Position = (i32, i32);
pub type ObjectID = u32;
