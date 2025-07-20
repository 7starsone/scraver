// Importiamo le librerie potenziate, inclusa quella nuova e corretta
const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');
const puppeteerExtra = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// Applichiamo il plugin "stealth" a puppeteer-extra
puppeteerExtra.use(StealthPlugin());

module.exports = async (req, res) => {
    const urlToScrape = req.query.url;

    if (!urlToScrape) {
        return res.status(400).send('Please provide a URL to scrape.');
    }

    let browser = null;
    try {
        // Carichiamo un font di default. Questo è un trucco comune per stabilizzare
        // il rendering del browser in ambienti serverless.
        await chromium.font('https://raw.githack.com/googlei18n/noto-cjk/main/NotoSansCJK-Regular.ttc');

        // Usiamo puppeteer-extra per lanciare il browser, ma con la configurazione
        // fornita dalla nostra nuova libreria @sparticuz/chromium
        browser = await puppeteerExtra.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
            ignoreHTTPSErrors: true,
        });

        const page = await browser.newPage();
        
        // Andiamo alla pagina. Il timeout è aumentato per sicurezza.
        await page.goto(urlToScrape, { 
            waitUntil: 'networkidle0',
            timeout: 25000 
        });

        const content = await page.content();
        
        res.setHeader('Content-Type', 'text/xml; charset=utf-8');
        res.status(200).send(content);

    } catch (error) {
        console.error(error);
        // Miglioramento: usiamo String(error) per catturare anche errori non standard
        res.status(500).send('The server encountered an error while scraping the page: ' + String(error));
    } finally {
        if (browser !== null) {
            await browser.close();
        }
    }
};
