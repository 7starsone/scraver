const puppeteer = require('puppeteer-core');

module.exports = async (req, res) => {
    console.log("--- DEBUG VERCEL: Funzione avviata. ---");

    const urlToScrape = req.query.url;
    // CORREZIONE CHIAVE: Leggiamo 'token' invece di 'apiKey'
    const apiToken = req.query.token;
    
    console.log(`DEBUG VERCEL: URL da visitare: ${urlToScrape}`);
    console.log(`DEBUG VERCEL: Token ricevuto: ${apiToken ? apiToken.substring(0, 4) + '...' : 'NESSUNO'}`);

    if (!urlToScrape || !apiToken) {
        console.log("DEBUG VERCEL: ERRORE - Parametri mancanti.");
        return res.status(400).send('URL and token parameters are required.');
    }

    let browser = null;
    try {
        // Usiamo il token corretto per la connessione
        const browserWSEndpoint = `wss://chrome.browserless.io?token=${apiToken}&--stealth`;
        console.log("DEBUG VERCEL: Tentativo di connessione a Browserless...");

        browser = await puppeteer.connect({ browserWSEndpoint });
        console.log("DEBUG VERCEL: Connessione a Browserless riuscita!");

        const page = await browser.newPage();
        console.log("DEBUG VERCEL: Nuova pagina creata.");
        
        await page.goto(urlToScrape, { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        console.log("DEBUG VERCEL: Navigazione alla pagina completata.");

        const content = await page.content();
        console.log("DEBUG VERCEL: Contenuto della pagina estratto con successo.");
        
        res.setHeader('Content-Type', 'text/xml; charset=utf-g');
        res.status(200).send(content);

    } catch (error) {
        console.error("DEBUG VERCEL: ERRORE CATTURATO NEL BLOCCO CATCH:", error);
        res.status(500).send('The server encountered an error while scraping the page: ' + String(error));
    } finally {
        if (browser !== null) {
            console.log("DEBUG VERCEL: Chiusura connessione a Browserless.");
            await browser.disconnect();
        }
        console.log("--- DEBUG VERCEL: Esecuzione terminata. ---");
    }
};
