use rocket::serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct Fail {
    context: String,
    message: String,
}

impl Fail {
    pub fn fail(context: &str, message: &str) -> Fail {
        Fail {
            context: String::from(context),
            message: String::from(message)
        }
    }
}