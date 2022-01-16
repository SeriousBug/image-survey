//! SeaORM Entity. Generated by sea-orm-codegen 0.5.0

use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel)]
#[sea_orm(table_name = "Votes")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub token_id: String,
    pub date_cast: String,
    #[sea_orm(primary_key, auto_increment = false)]
    pub question_id: String,
    pub option_id: String,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::options::Entity",
        from = "Column::OptionId",
        to = "super::options::Column::Id",
        on_update = "NoAction",
        on_delete = "NoAction"
    )]
    Options,
    #[sea_orm(
        belongs_to = "super::questions::Entity",
        from = "Column::QuestionId",
        to = "super::questions::Column::Id",
        on_update = "NoAction",
        on_delete = "NoAction"
    )]
    Questions,
}

impl Related<super::options::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Options.def()
    }
}

impl Related<super::questions::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Questions.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}