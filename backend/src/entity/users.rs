//! SeaORM Entity. Generated by sea-orm-codegen 0.5.0

use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel)]
#[sea_orm(table_name = "Users")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub username: Option<String>,
    pub r#type: String,
    #[sea_orm(column_type = "Custom(\"BLOB\".to_owned())")]
    pub salt: String,
    #[sea_orm(column_type = "Custom(\"BLOB\".to_owned())")]
    pub password: String,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(has_many = "super::tokens::Entity")]
    Tokens,
}

impl Related<super::tokens::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Tokens.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
