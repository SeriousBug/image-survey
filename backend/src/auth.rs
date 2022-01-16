use crate::entity::users;
use crate::fairings::database::Db;
use crate::fail::Fail;

use sea_orm::strum::Display;
use tracing_unwrap::ResultExt;

use sea_orm::{entity::*, query::*, DatabaseConnection};
use sea_orm_rocket::{Connection};

use rocket::serde::json::{serde_json::json, Json, Value};
use rocket::serde::{Deserialize, Serialize};

use anyhow::{self, bail};

use scrypt::{
    password_hash::{
        rand_core::OsRng,
        PasswordHash, PasswordHasher, PasswordVerifier, SaltString
    },
    Scrypt
};


#[derive(Serialize, Deserialize, Display)]
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

pub async fn add_user(db: &DatabaseConnection, username: String, password: String, level: TokenType) -> anyhow::Result<()> {
    let salt = SaltString::generate(&mut OsRng);
    let password_hash = Scrypt.hash_password(password.as_bytes(), &salt)?.to_string();
    let user = users::ActiveModel {
        username: Set(username),
        password: Set(password_hash),
        salt: Set(salt.as_str().to_string()),
        usertype: Set(level.to_string()),
    };
    users::Entity::insert(user).exec(db).await?;
    Ok(())
}

pub async fn remove_user(db: &DatabaseConnection, username: String) -> anyhow::Result<()> {
    let user = users::Entity::find_by_id(username).one(db).await?;
    match user {
        Some(data) => {
            data.delete(db).await?;
        }
        None => {
            bail!("Failed to find the user to delete");
        }
    }
    Ok(())
}