const puppeteer = require('puppeteer-core');

module.exports = async (req, res) => {
    const urlToScrape = req.query.url;
    // CORREZIONE CHIAVE: Leggiamo 'token' invece di 'apiKey'
    const apiToken = req.query.token;

    if (!urlToScrape || !apiToken) {
        return res.status(400).send('URL and token parameters are required.');
    }

    let browser = null;
    try {
        // Usiamo il token corretto per la connessione
        const browserWSEndpoint = `wss://chrome.browserless.io?token=${apiToken}&--stealth`;

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
            await browser.disconnect();
        }
    }
};
