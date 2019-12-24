const puppeteer = require('puppeteer');

(async () => {

  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto('http://www.leafninja.com/biographies.php');

  let links = await getAllBiographyLinks(page)

  let characters = []
  for (let i = 0; i < links.length; i++) {
    await page.goto(links[i].url);
    console.log(await page.evaluate(() => document.location.href))
    characters = [...characters, ...await getCharactersFromBiographyPage(page)]
  }

  characters.forEach(c => console.log(c))

  browser.close()
})()

async function getCharactersFromBiographyPage(page) {
  return await page.evaluate(() => {
    let names = Array.from(document.querySelectorAll('[bgcolor="8AB275"]'))
    let images = Array.from(document.querySelectorAll('[width="15%"]'))
      .filter(tableContainer => Array.from(tableContainer.children).length > 0 ? tableContainer.children[0].nodeName.toLowerCase() === "img" : false)
      .map(rawIimage => Array.from(rawIimage.querySelectorAll('[border="1"]'))[0].src)
  return names
    .filter(name => name)
    .map((name, i) => {
      return {
        image: images[i],
        name: name.innerText
          .replace('[Click for Full Biography (Spoilers)]', '')
          .replace('�', '')
      }
    })
})
}

async function getAllBiographyLinks(page) {
  return await page.evaluate(() =>
    Array.from(document.getElementsByTagName(`center`)[1].getElementsByTagName(`a`))
      .map(biographyLink => ({ url: biographyLink.href }))
  );
}
