const axios = require('axios');
const cheerio = require('cheerio');
const { JSDOM } = require('jsdom');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send({ error: 'Only POST allowed' });
    return;
  }

  const { url } = req.body;

  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const baseUrl = new URL(url);

    const logoLinks = [];
    $('img, link').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('href');
      if (src && src.toLowerCase().endsWith('.svg')) {
        const absoluteUrl = new URL(src, baseUrl).href;
        logoLinks.push(absoluteUrl);
      }
    });

    if (logoLinks.length > 0) {
      return res.json({ found: true, links: logoLinks });
    }

    const dom = new JSDOM(html);
    const inlineSVGs = Array.from(dom.window.document.querySelectorAll('svg'));

    inlineSVGs.forEach(svg => {
      // Patch missing viewBox if width and height are present
      if (!svg.hasAttribute('viewBox') && svg.getAttribute('width') && svg.getAttribute('height')) {
        svg.setAttribute(
          'viewBox',
          `0 0 ${svg.getAttribute('width')} ${svg.getAttribute('height')}`
        );
      }
    });

    if (inlineSVGs.length > 0) {
      const svgStrings = inlineSVGs.map(svg => svg.outerHTML.trim());
      return res.json({ foundInline: true, svgs: svgStrings });
    }

    return res.json({ found: false, message: 'No SVG logos could be found on this page.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch or parse the page.' });
  }
};
