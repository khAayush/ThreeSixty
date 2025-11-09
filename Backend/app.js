const express = require('express');
const app = express();

app.use(express.json());

app.listen(process.env.PORT, () => {
    console.log(`Listening to requests on port: ${process.env.PORT}`);
});