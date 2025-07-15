const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send({ error: 'Only POST allowed' });
    return;
  }

  const { url } = req.body;

  if (!url || !/^https?:\/\//i.test(url)) {
    return res.status(400).json({ error: 'Invalid or missing URL.' });
  }

  try {
    console.log('Requested URL:', url);

    const execPath = (await chromium.executablePath) || '/usr/bin/chromium-browser';

    console.log('Launching browser with executablePath:', execPath);

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: execPath,
      headless: chromium.headless !== false
    });

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
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Failed to fetch or parse the page.' });
  }
};
