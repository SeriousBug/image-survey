#![feature(proc_macro_hygiene, decl_macro)]

mod fairings;
use fairings::logger::Logger;
use fairings::database::Db;
use tracing::Level;
use sea_orm_rocket::{Database, Connection};

#[macro_use] extern crate rocket;
#[macro_use] extern crate rocket_contrib;
#[macro_use] extern crate serde_derive;
use rocket_contrib::json::{Json, JsonValue};

#[get("/")]
fn index() -> &'static str {
    "Hello, world!"
}

#[derive(Serialize, Deserialize)]
enum TokenType {
    ANON,
    VIEW,
    MOD,
}

#[derive(Serialize, Deserialize)]
struct Token {
    token: String,
    tokenType: TokenType,
}

#[derive(Serialize, Deserialize)]
struct Login {
    username: String,
    password: String,
}

type LoginAttempt = Option<Login>;


#[post("/auth", format = "json", data = "<login>")]
fn auth(conn: Connection<'_, Db>, login: Json<Login>) -> JsonValue {
    json!(Token {
        token: login.username,
        tokenType: TokenType::VIEW
    })
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
