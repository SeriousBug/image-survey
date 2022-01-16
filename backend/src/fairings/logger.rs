use rocket::fairing::{Info, Fairing, Kind};
use tracing::Level;
use tracing_subscriber::FmtSubscriber;

pub struct Logger {
    pub max_level: Level,
}

#[rocket::async_trait]
impl Fairing for Logger {
    fn info(&self) -> Info {
        Info { name: "Logger", kind: Kind::Ignite }
    }

    async fn on_ignite(&self, rocket: rocket::Rocket<rocket::Build>) -> rocket::fairing::Result {
        let subscriber = FmtSubscriber::builder().with_max_level(self.max_level).finish();
        tracing::subscriber::set_global_default(subscriber).unwrap();
        return Ok(rocket);
    }
}