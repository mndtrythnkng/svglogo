const puppeteer = require('puppeteer');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send({ error: 'Only POST allowed' });
    return;
  }

  const { url } = req.body;

  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const svgHTMLs = await page.$$eval('svg', svgs =>
      svgs.map(svg => svg.outerHTML.trim())
    );

    await browser.close();

    if (svgHTMLs.length > 0) {
      return res.json({ foundInline: true, svgs: svgHTMLs });
    }

    return res.json({ found: false, message: 'No SVG logos could be found on this page.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch or parse the page.' });
  }
};
