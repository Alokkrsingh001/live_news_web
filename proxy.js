const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.static('.'));

const API_KEY = '3f8a4f44711b4644a6363a065e6b991f';
const BASE_URL = 'https://newsapi.org/v2';

app.get('/api/top-headlines', async (req, res) => {
    try {
        const params = new URLSearchParams(req.query);
        params.append('apiKey', API_KEY);
        const url = `${BASE_URL}/top-headlines?${params}`;
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Proxy error' });
    }
});

app.get('/api/everything', async (req, res) => {
    try {
        const params = new URLSearchParams(req.query);
        params.append('apiKey', API_KEY);
        const url = `${BASE_URL}/everything?${params}`;
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Proxy error' });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
});
