CREATE TABLE IF NOT EXISTS city (
    id SERIAL PRIMARY KEY NOT NULL,
    search_query VARCHAR(265) NOT NULL,
    display_name VARCHAR(265) NOT NULL,
    lon VARCHAR(265) NOT NULL,
    lat VARCHAR(265) NOT NULL
);