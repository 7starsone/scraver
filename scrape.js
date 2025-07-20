const puppeteer = require('puppeteer-core');
const chrome = require('chrome-aws-lambda');

// Funzione principale che Vercel eseguirà
module.exports = async (req, res) => {
    // Ottieni l'URL da visitare dalla query string (es. /api/scrape?url=https://...)
    const urlToScrape = req.query.url;

    if (!urlToScrape) {
        return res.status(400).send('Please provide a URL to scrape.');
    }

    let browser = null;
    try {
        // Lancia un'istanza di browser headless ottimizzata per ambienti serverless
        browser = await puppeteer.launch({
            args: chrome.args,
            executablePath: await chrome.executablePath,
            headless: chrome.headless,
        });

        const page = await browser.newPage();
        
        // Imposta uno user agent realistico
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36');

        // Naviga alla pagina
        await page.goto(urlToScrape, { waitUntil: 'networkidle2' });

        // Estrai il contenuto HTML della pagina
        const content = await page.content();
        
        // Invia l'HTML come risposta
        res.status(200).send(content);

    } catch (error) {
        console.error(error);
        res.status(500).send('The server encountered an error while scraping the page.');
    } finally {
        if (browser !== null) {
            await browser.close();
        }
    }
};
