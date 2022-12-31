//Dependencies
const Puppeteer_Stealth = require("puppeteer-extra-plugin-stealth")
const Puppeteer = require("puppeteer-extra")
const {executablePath} = require('puppeteer')

//Puppeteer
Puppeteer.default.use(Puppeteer_Stealth())

const { toJSON }  = require('css-convert-json');

async function getBrowser(){
    return await Puppeteer.default.launch({
        "headless": true,
        "args": ["--fast-start", "--disable-extensions", "--no-sandbox", "--disable-setuid-sandbox"],
        "ignoreHTTPSErrors": true,
        executablePath: executablePath(),
    })
}

//Main
async function GetUrl(url, headers = "", useragent = ""){
    return new Promise(async(resolve) =>{
        const browser = await getBrowser()
        const page = await browser.newPage()      

        if(headers){
            await page.setExtraHTTPHeaders(headers)
        }

        if(useragent){
            await page.setUserAgent(useragent)
        }

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 0})
        const page_content = await page.content()
       
        await browser.close()
        resolve(page_content)
    })
}


async function GetUrlAndStyle(url)
{
    var style = ""
    const browser = await getBrowser()
    const page = await browser.newPage();

    page.on('response',async response => {
      if(response.request().resourceType() === 'stylesheet') {
        style += await response.text();
      }
    });
  
    await page.goto(url, {  waitUntil: 'networkidle2',timeout: 0})
    const page_content = await page.content()
   
    await browser.close();
  
    _STYLE = toJSON(style);

    return [page_content, _STYLE]
}

async function HtmlToPng(html, selector) {
    const browser = await getBrowser()
    const page = await browser.newPage();
    
    await page.setContent(html);

    // Get the bounding box of the div element
    const {x, y, width, height} = await page.evaluate((selector) => {
        const div = document.querySelector(selector);
        const {x, y, width, height} = div.getBoundingClientRect();
        return {x, y, width, height};
    }, selector);

    const imageBuffer = await page.screenshot({
        encoding: 'buffer', 
        type: 'png',
        clip: {x, y, width, height},
        omitBackground:true
    });

    await browser.close();

    return imageBuffer;
}
  

exports.GetUrl = GetUrl
exports.GetUrlAndStyle = GetUrlAndStyle
exports.HtmlToPng = HtmlToPng