// Non usiamo più Puppeteer, ma una libreria HTTP leggera
const axios = require('axios');

module.exports = async (req, res) => {
    const urlToFetch = req.query.url;

    if (!urlToFetch) {
        return res.status(400).json({ error: 'Please provide a URL parameter.' });
    }

    try {
        // Esegui una semplice richiesta GET, ma con uno User-Agent da browser
        const response = await axios.get(urlToFetch, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
            }
        });

        // Invia il contenuto della risposta (l'XML del feed)
        // Imposta l'header corretto per far capire che è XML
        res.setHeader('Content-Type', 'application/xml');
        res.status(200).send(response.data);

    } catch (error) {
        console.error(error);
        // Se c'è un errore, restituisci un messaggio più specifico
        const statusCode = error.response ? error.response.status : 500;
        const message = error.message || 'An error occurred while fetching the URL.';
        res.status(statusCode).json({ error: message });
    }
};
