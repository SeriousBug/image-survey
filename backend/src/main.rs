mod fairings;
mod entity;
mod auth;
mod fail;

#[macro_use] extern crate rocket;

use sea_orm_rocket::Database;
use fairings::database::Db;
use fairings::logger::Logger;
use tracing::Level;


#[get("/")]
fn index() -> &'static str {
    "Hello, world!"
}



#[launch]
async fn rocket() -> _ {
    let logger = Logger {
        max_level: Level::INFO,
    };
    rocket::build()
        .attach(logger)
        .attach(Db::init())
        .mount("/", routes![index, auth::auth])
}
