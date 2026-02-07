module.exports = async (req, res) => {
  const API_KEY = '3f8a4f44711b4644a6363a065e6b991f';
  const BASE_URL = 'https://newsapi.org/v2';

  const params = new URLSearchParams(req.query);
  params.append('apiKey', API_KEY);
  const url = `${BASE_URL}/top-headlines?${params}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Proxy error' });
  }
};
