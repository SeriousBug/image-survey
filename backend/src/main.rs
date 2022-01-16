mod fairings;
use fairings::logger::Logger;
use fairings::database::Db;
mod entity;
use entity::users;

use tracing::Level;
use tracing_unwrap::ResultExt;

use sea_orm_rocket::{Database, Connection};
use sea_orm::{entity::*, query::*};

#[macro_use] extern crate rocket;
use rocket::serde::json::{Json, Value, serde_json::json};
use rocket::serde::{Serialize, Deserialize};

#[get("/")]
fn index() -> &'static str {
    "Hello, world!"
}

#[derive(Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
enum TokenType {
    ANON,
    VIEW,
    MOD,
}

#[derive(Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
struct Token {
    token: String,
    tokenType: TokenType,
}

#[derive(Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
struct Login {
    username: String,
    password: String,
}

#[derive(Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
struct Error {
    context: String,
    message: String,
}

#[post("/auth", format = "json", data = "<login>")]
async fn auth(conn: Connection<'_, Db>, login: Option<Json<Login>>) -> Value {
    match login {
        Some(data) => {
            let db = conn.into_inner();
            
            // TODO: Should respond with an error if fails
            let found = users::Entity::find_by_id(data.username.clone()).one(db).await.unwrap_or_log();
            match found {
                Some(foundData) => {
                    json!(Token {
                        token: foundData.username,
                        tokenType: TokenType::VIEW
                    })
                },
                None => {
                    json!(Error {
                        context: String::from("auth"),
                        message: String::from("User or password incorrect")
                    })
                }
            }
            
        },
        None => json!(Token {
            token: String::from("anon"),
            tokenType: TokenType::ANON
        }),
    }
}

#[launch]
async fn rocket() -> _ {
    let logger = Logger {
        max_level: Level::INFO,
    };
    rocket::build()
        .attach(logger)
        .attach(Db::init())
        .mount("/", routes![index, auth])
}
