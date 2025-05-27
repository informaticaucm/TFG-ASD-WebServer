import puppeteer from 'puppeteer';

(async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Establece el contenido HTML
        await page.setContent('<h1>Hola, mundo</h1>');

        // Genera el PDF
        await page.pdf({ path: 'test.pdf', format: 'A4', printBackground: true });

        await browser.close();
        console.log('PDF generado correctamente: test.pdf');
    } catch (error) {
        console.error('Error al generar el PDF:', error);
    }
})();