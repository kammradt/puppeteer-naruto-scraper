const puppeteer = require('puppeteer');

(async () => {

  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto('http://www.leafninja.com/biographies.php');

  let links = await getAllBiographyLinks(page)

  let characters = []
  for (let i = 0; i < links.length; i++) {
    await page.goto(links[i].url);
    characters = [...characters, ...await getCharactersFromBiographyPage(page)]
  }
  
  browser.close()
})()

async function getCharactersFromBiographyPage(page) {
  return await page.evaluate(() => {
    let names = Array.from(document.querySelectorAll('[bgcolor="8AB275"]'))
    let images = Array.from(document.querySelectorAll('[width="15%"]'))
      .filter(tableContainer => {
        let containerElements = Array.from(tableContainer.children)
        if (containerElements.length > 0) {
          let possibleImageTag = containerElements[0]
          return possibleImageTag.nodeName.toLowerCase() === "img"
        }
      })
      .map(rawIimage => {
        let imageTag = Array.from(rawIimage.querySelectorAll('[border="1"]'))[0]
        return imageTag.src
      })

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
  return await page.evaluate(() => {
    let tableWithLinks = Array.from(document.getElementsByTagName(`center`)[1].getElementsByTagName(`a`))
    return tableWithLinks.map(biographyLink => ({
      url: biographyLink.href
    }))
  });
}
