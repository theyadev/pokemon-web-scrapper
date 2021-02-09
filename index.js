const puppeteer = require("puppeteer");
const fs = require("fs");
(async () => {
  const pokemons = JSON.parse(fs.readFileSync("./pokemons.json", "utf8"));
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(
    "https://www.pokepedia.fr/Cat%C3%A9gorie:Pok%C3%A9mon_de_la_premi%C3%A8re_g%C3%A9n%C3%A9ration"
  );

  const result = await page.evaluate(() => {
    let y = [];
    for (
      let i = 1;
      i < 2;//document.querySelector(".mw-category").childNodes.length;
      i++
    ) {
      document
        .querySelector(".mw-category")
        .childNodes[i].querySelectorAll("a")
        .forEach((e) => {
          y.push(e.href);
        });
    }

    return { y };
  });
  //console.log(result);

  async function getData() {
    let pokemonsSrc = [];
    for (let i = 0; i < result.y.length; i++) {
      console.log("Etape "+i+" / "+ result.y.length);
      const page = await browser.newPage();
      await page.goto(result.y[i]);
      const res = await page.evaluate(() => {
        const src = document.querySelector(".illustration").querySelector("img")
          .src;
        const englishName = document
          .querySelector(".ficheinfo")
          .querySelectorAll("tr")[2]
          .querySelector("td").innerText;
        //console.log(englishName);
        return { src, englishName };
      });
      //console.log(res);
      const o = "https://www.pokepedia.fr/".length;

      const p = res.src.replace("thumb/", "");
      const j = p.split("/250px");
      pokemonsSrc.push({
        name: decodeURI(result.y[i].slice(o)),
        aliase: res.englishName,
        image: j[0],
      });

      await page.close()
    }
    return pokemonsSrc;
  }
  getData().then((srcs) => {
    //console.log(srcs);
    const newPokemons = [...pokemons, ...srcs];

    fs.writeFileSync("./pokemons.json", JSON.stringify(newPokemons));

    browser.close().then(() => {
      console.log("JE SUIS FERMÉ !!!!!!!!!!!!");
    });
  });
  //await page.screenshot({ path: 'example.png' });
})();
