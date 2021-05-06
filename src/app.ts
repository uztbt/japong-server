import express from 'express';

const app = express();
const port = 3000;
app.get('/', (_req, res) => {
    res.send("Love and courage are the key to happiness");
});
app.listen(port, () => {
    return console.log(`Server is listening on ${port}`);
});