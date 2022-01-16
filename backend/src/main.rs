#![feature(proc_macro_hygiene, decl_macro)]
mod auth;
mod entity;
mod fail;
mod fairings;

#[macro_use]
extern crate rocket;

use fairings::database::{Db, getDbConnection};
use fairings::logger::Logger;
use sea_orm_rocket::Database;
use tracing::Level;
use tracing_unwrap::ResultExt;
use std::path::PathBuf;
use structopt::StructOpt;

#[get("/")]
fn index() -> &'static str {
    "Hello, world!"
}


#[derive(StructOpt)]
/// Add a new user to the server. Users can edit surveys and view survey results. Surveyees don't need to be users.
struct UserAdd {
    #[structopt(short, long)]
    username: String,
    // TODO: Should be promped on CLI instead to avoid the password being saved to CLI history
    #[structopt(short, long)]
    password: String,
}

#[derive(StructOpt)]
/// Remove a user.
struct UserRemove {
    #[structopt(short, long)]
    username: String,
}

#[derive(StructOpt)]
/// Manage users, who can edit the survey and view results.
enum User {
    #[structopt(name = "add")]
    UserAdd(UserAdd),
    #[structopt(name = "remove")]
    UserRemove(UserRemove),
}

#[derive(StructOpt)]
enum Commands {
    User(User),
}


#[derive(StructOpt)]
/// The CLI options for the image-survey backend.
struct Opt {
    #[structopt(subcommand)]
    command: Option<Commands>,
}

async fn cli_command(command: Commands) -> anyhow::Result<()> {
    let db = getDbConnection().await?;
    match command {
        Commands::User(user) => {
            match user {
                User::UserAdd(add) => auth::add_user(&db, add.username, add.password, auth::TokenType::MOD).await,
                User::UserRemove(remove) => auth::remove_user(&db, remove.username).await,
            }
        }
    }
}


#[rocket::main]
async fn main() {
    let opts = Opt::from_args();
    match opts.command {
        Some(command) => {
            // Running a CLI command
            cli_command(command).await.unwrap_or_log();
        }
        None => {
            // Running the server
            let logger = Logger {
                max_level: Level::INFO,
            };
            rocket::build()
            .attach(logger)
            .attach(Db::init())
            .mount("/", routes![index, auth::auth])
            .launch().await;
        },
    }
}
