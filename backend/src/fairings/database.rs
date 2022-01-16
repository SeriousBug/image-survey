use rocket;
use sea_orm::{self};
use sea_orm_rocket::Database;
use tracing_unwrap::ResultExt;



#[derive(Database, Debug)]
#[database("sea_orm")]
pub struct Db(DbConn);

#[derive(Debug, Clone)]
pub struct DbConn {
    pub conn: sea_orm::DatabaseConnection,
}

#[async_trait]
impl sea_orm_rocket::Pool for DbConn {
    type Error = sea_orm::error::DbErr;

    type Connection = sea_orm::DatabaseConnection;

    async fn init(_figment: &rocket::figment::Figment) -> Result<Self, Self::Error> {
        let url = dotenv::var("DATABASE_URL").unwrap_or_log();
        let conn = sea_orm::Database::connect(url).await?;

        Ok(DbConn { conn })
    }

    fn borrow(&self) -> &Self::Connection {
        &self.conn
    }
}