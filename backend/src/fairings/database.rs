use rocket;
use sea_orm::{self, DatabaseConnection};
use sea_orm_rocket::Database;
use tracing_unwrap::ResultExt;



#[derive(Database, Debug)]
#[database("sea_orm")]
pub struct Db(DbConn);

#[derive(Debug, Clone)]
pub struct DbConn {
    pub conn: sea_orm::DatabaseConnection,
}

pub async fn getDbConnection() -> Result<DatabaseConnection, <DbConn as sea_orm_rocket::Pool>::Error>  {
    let url = dotenv::var("DATABASE_URL").unwrap_or_log();
    sea_orm::Database::connect(url).await
}

#[async_trait]
impl sea_orm_rocket::Pool for DbConn {
    type Error = sea_orm::error::DbErr;

    type Connection = sea_orm::DatabaseConnection;

    async fn init(_figment: &rocket::figment::Figment) -> Result<Self, Self::Error> {
        let conn: DatabaseConnection = getDbConnection().await?;
        Ok(DbConn { conn })
    }

    fn borrow(&self) -> &Self::Connection {
        &self.conn
    }
}