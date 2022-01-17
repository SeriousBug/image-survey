-- sqlite
CREATE TABLE Meta (
    key TEXT PRIMARY KEY,
    value TEXT
) WITHOUT ROWID;

CREATE TABLE Users (
    username TEXT PRIMARY KEY,
    usertype TEXT NOT NULL,
    salt BLOB NOT NULL,
    password BLOB NOT NULL
) WITHOUT ROWID;

CREATE TABLE Tokens (
    id TEXT PRIMARY KEY,
    date_generated TEXT NOT NULL,
    username TEXT,
    FOREIGN KEY (username) REFERENCES Users(username)
) WITHOUT ROWID;

CREATE TABLE Questions (
    id TEXT PRIMARY KEY,
    -- Some questions may not have an original (just A/B)
    original_id TEXT
    FOREIGN KEY (original) REFERENCES Options(id)
) WITHOUT ROWID;

CREATE TABLE Options (
    id TEXT PRIMARY KEY,
    question_id TEXT NOT NULL,
    -- Where to find the image. Sent directly to the client.
    image_url TEXT NOT NULL,
    FOREIGN KEY (question_id) REFERENCES Questions(id)
) WITHOUT ROWID;

CREATE TABLE Votes (
    token_id TEXT NOT NULL,
    date_cast TEXT NOT NULL,
    question_id TEXT NOT NULL,
    option_id TEXT NOT NULL,
    PRIMARY KEY (token_id, question_id)
    FOREIGN KEY (question_id) REFERENCES Questions(id)
    FOREIGN KEY (option_id) REFERENCES Options(id)
) WITHOUT ROWID;

-- Ensure votes have matching question and option IDs. This could be avoided by
-- votes only referencing the option, but then ensuring that a user only votes
-- once per question would be harder.
CREATE TRIGGER VoteMatchesQuestionInsert BEFORE INSERT ON Votes
WHEN NOT EXISTS (
    SELECT * FROM Options
    -- There's a matching option
    WHERE id = NEW.option_id
        -- and that option has the same question
        AND question_id = NEW.question_id
) BEGIN
    SELECT RAISE(FAIL, "The question of the vote doesn't match the question of the option");
END;
-- Need to duplicate this because same trigger can't apply to both
CREATE TRIGGER VoteMatchesQuestionUpdate BEFORE UPDATE ON Votes
WHEN NOT EXISTS (
    SELECT * FROM Options
    -- There's a matching option
    WHERE id = NEW.option_id
        -- and that option has the same question
        AND question_id = NEW.question_id
) BEGIN
    SELECT RAISE(FAIL, "The question of the vote doesn't match the question of the option");
END;
