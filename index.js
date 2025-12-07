const express = require('express');
const shorId = require('short-id');
const db = require('./db/mysql');
const app = express();

app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('home');
});

app.post('/shortUrl', (req, res) => {
    const originalUrl = req.body.originalUrl;
    console.log(originalUrl);

    if (!originalUrl) {
        return res.status(400).send('Invalid URL');
    }

    db.query("SELECT * FROM url WHERE longUrl = ?", [originalUrl], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }

        if (results.length === 0) {

            const short = shorId.generate();
            const url = {
                longUrl: originalUrl,
                shortUrl: short,
                count: 1
            };

            db.query("INSERT INTO url SET ?", url, (err, results) => {
                if (err) {
                    console.error("Error inserting data:", err);
                    return res.status(500).send("Insert error");
                }

                // After inserting → show the user the short URL
                // res.send(`Short URL created: http://localhost:5000/${short}`);
            });

        } else {
            // URL already exists
            // res.send(`This URL already exists: http://localhost:5000/${results[0].shortUrl}`);
            const _short = results[0].shortUrl;
            const _count = results[0].count + 1;

            db.query("UPDATE url SET count = ? WHERE shortUrl = ?", [_count, _short], (err, updateResults) => {
                if (err) {
                    console.error("Error updating count:", err);
                    return res.status(500).send("Update error");
                }
            });
        }
    });
});

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
