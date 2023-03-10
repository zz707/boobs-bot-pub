CREATE TABLE ratings (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	url TEXT,
	likes INTEGER,
	dislikes INTEGER,
	created_at DATETIME,
	updated_at DATETIME
);
