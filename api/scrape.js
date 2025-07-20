// Importiamo le librerie potenziate
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const chrome = require('chrome-aws-lambda');

// Applichiamo il plugin "stealth" per rendere il browser invisibile
puppeteer.use(StealthPlugin());

module.exports = async (req, res) => {
    const urlToScrape = req.query.url;

    if (!urlToScrape) {
        return res.status(400).send('Please provide a URL to scrape.');
    }

    let browser = null;
    try {
        // Usiamo la stessa configurazione di prima, ma con il nostro puppeteer "stealth"
        browser = await puppeteer.launch({
            args: chrome.args,
            executablePath: await chrome.executablePath,
            headless: chrome.headless,
        });

        const page = await browser.newPage();
        
        // Andiamo alla pagina. Il plugin stealth gestirà tutti gli header e le impronte.
        await page.goto(urlToScrape, { 
            waitUntil: 'networkidle0', // Aspettiamo che la rete sia completamente inattiva
            timeout: 15000 // Aumentiamo leggermente il timeout a 15 secondi per sicurezza
        });

        const content = await page.content();
        
        res.setHeader('Content-Type', 'text/xml; charset=utf-8');
        res.status(200).send(content);

    } catch (error) {
        console.error(error);
        res.status(500).send('The server encountered an error while scraping the page: ' + error.message);
    } finally {
        if (browser !== null) {
            await browser.close();
        }
    }
};
