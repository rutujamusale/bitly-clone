const express = require('express');
const shortId = require('short-id');
const db = require('./db/mysql');
const e = require('express');
const app = express();

app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'ejs');

function getLinks(req, res) {
    db.query("SELECT * FROM url", (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Server error');
        }
        else {
            res.render('home', { results: results });
        }
    });
}
app.get('/', (req, res) => {
    getLinks(req, res);
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

            // const short = shortId.generate();
            let short = req.body.customCode?.trim();

            // If custom code provided → validate
            if (short) {
                // must be A-Z a-z 0-9 and 6–8 chars
                const codeRegex = /^[A-Za-z0-9]{6,8}$/;

                if (!codeRegex.test(short)) {
                    return res.status(400).send("Invalid custom code. Only A-Z a-z 0-9 allowed, 6–8 characters.");
                }
            } else {
                // auto-generate code if no custom code
                short = shortId.generate().replace(/[^A-Za-z0-9]/g, "").substring(0, 7);
            }

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
            getLinks(req, res);
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
            getLinks(req, res);
        }
    });
});
app.get('/:shortUrl', (req, res) => {
    const shortUrl = req.params.shortUrl;
    db.query("SELECT * FROM url WHERE shortUrl = ?", [shortUrl], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
        if (results.length === 0) {
            return res.status(404).send('URL not found');
        }

        const longUrl = results[0].longUrl;
        res
            .status(302)
            .header("Location", longUrl)
            .send(`Redirecting to ${longUrl}`);

    });
});
app.get('/delete/:id', (req, res) => {
    const id = req.params.id;

    db.query("DELETE FROM url WHERE id = ?", [id], (err, result) => {
        if (err) {
            console.error("Delete error:", err);
            return res.status(500).send("Failed to delete URL");
        }

        res.redirect('/');

    });
});
app.get('/healthz', (req, res) => {
    res.status(200).json({
        ok: true,
        version: "1.0",
        uptime: process.uptime()
    });
});

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});


