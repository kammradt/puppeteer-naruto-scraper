const puppeteer = require('puppeteer');

(async () => {

  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto('http://www.leafninja.com/biographies.php', { waitUntil: 'domcontentloaded' });

  let links = await getAllBiographyLinks(page)

  let characters = []
  for (let link of links) {
    await page.goto(link)
    characters = [...characters, ...await getCharactersFromBiographyPage(page)]
  }

  browser.close()
})()

async function getCharactersFromBiographyPage(page) {
  return await page.evaluate(() => {
    let names = [...document.querySelectorAll('[bgcolor="8AB275"]')]
    let images = [...document.querySelectorAll('[width="15%"] > img[border="1"]')]
      .map(imageTag => imageTag.src)

    return names
      .filter(validName => validName)
      .map((name, i) => ({
        image: images[i],
        name: name.innerText
          .replace('[Click for Full Biography (Spoilers)]', '')
          .replace('�', '')
      })
      )
  })
}

async function getAllBiographyLinks(page) {
  return await page.evaluate(() =>
    [...document.getElementsByTagName(`center`)[1].getElementsByTagName(`a`)]
      .map(biographyLink => biographyLink.href)
  );
}
