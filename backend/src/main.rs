mod fairings;
use fairings::logger::Logger;
use fairings::database::{Db};
use tracing::Level;
use sea_orm_rocket::{Database};

#[macro_use]
extern crate rocket;


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
        .mount("/", routes![index])
}
