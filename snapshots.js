const PercyScript = require('@percy/script');

PercyScript.run(async (page, percySnapshot) => {
  await page.goto('http://css.loc');
  await percySnapshot('homepage');
});