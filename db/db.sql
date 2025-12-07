DROP table EXISTS url;

create table
    url (
        id INT PRIMARY KEY AUTO_INCREMENT,
        longUrl VARCHAR(256) Not NULL,
        shortUrl VARCHAR(256) NOT NULL UNIQUE,
        count INT DEFAULT 0,
        lastClicked TIMESTAMP NULL
    );

-- INSERT INTO
--     url (longUrl, shortUrl, count)
-- VALUES
--     (
--         'https://www.example.com/some/very/long/url/that/needs/to/be/shortened',
--         'http://bit.ly/abc123',
--         1
--     ),
--     (
--         'https://www.anotherexample.com/different/long/url/for/testing',
--         'http://bit.ly/def456',
--         1
--     );