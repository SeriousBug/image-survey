use std::error::Error;
use thiserror;
use rocket::serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug, thiserror::Error)]
#[serde(crate = "rocket::serde")]
#[error("error [{context}]: {message}")]
pub struct Fail {
    error: &'static str,
    context: String,
    message: String,
}

impl Fail {
    pub fn fail(context: &str, message: &str) -> Fail {
        Fail {
            error: "error",
            context: String::from(context),
            message: String::from(message)
        }
    }
}
