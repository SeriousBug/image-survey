use crate::entity::users;
use crate::fairings::database::Db;
use crate::fail::Fail;

use tracing_unwrap::ResultExt;

use sea_orm::{entity::*, query::*};
use sea_orm_rocket::{Connection};

use rocket::serde::json::{serde_json::json, Json, Value};
use rocket::serde::{Deserialize, Serialize};


#[derive(Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
pub enum TokenType {
    ANON,
    VIEW,
    MOD,
}

#[derive(Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct Token {
    token: String,
    token_type: TokenType,
}

#[derive(Serialize, Deserialize)]
#[serde(crate = "rocket::serde")]
pub struct Login {
    username: String,
    password: String,
}

#[post("/auth", format = "json", data = "<login>")]
pub async fn auth(conn: Connection<'_, Db>, login: Option<Json<Login>>) -> Value {
    match login {
        Some(data) => {
            let db = conn.into_inner();

            // TODO: Should respond with an error if fails
            let found = users::Entity::find_by_id(data.username.clone())
                .one(db)
                .await
                .unwrap_or_log();
            match found {
                Some(found_data) => {
                    json!(Token {
                        token: found_data.username,
                        token_type: TokenType::VIEW
                    })
                }
                None => {
                    json!(Fail::fail("auth", "User or password incorrect"))
                }
            }
        }
        None => json!(Token {
            token: String::from("anon"),
            token_type: TokenType::ANON
        }),
    }
}