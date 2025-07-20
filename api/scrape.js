const puppeteer = require('puppeteer-core');

module.exports = async (req, res) => {
    const urlToScrape = req.query.url;
    const apiKey = req.query.apiKey;

    if (!urlToScrape || !apiKey) {
        return res.status(400).send('URL and apiKey parameters are required.');
    }

    let browser = null;
    try {
        // Costruiamo l'URL di connessione al browser remoto di Browserless.io
        // Aggiungiamo &--stealth per attivare la modalità invisibile direttamente su Browserless!
        const browserWSEndpoint = `wss://chrome.browserless.io?token=${apiKey}&--stealth`;

        // Ci connettiamo al browser remoto invece di lanciarne uno locale
        browser = await puppeteer.connect({ browserWSEndpoint });

        const page = await browser.newPage();
        
        await page.goto(urlToScrape, { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });

        const content = await page.content();
        
        res.setHeader('Content-Type', 'text/xml; charset=utf-8');
        res.status(200).send(content);

    } catch (error) {
        console.error(error);
        res.status(500).send('The server encountered an error while scraping the page: ' + String(error));
    } finally {
        if (browser !== null) {
            // Chiudiamo la connessione al browser remoto
            await browser.disconnect();
        }
    }
};
