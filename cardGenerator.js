const PuppeteerFuncs = require("./PuppeteerFuncs.js")
const fs = require('fs');
const style = fs.readFileSync('./styles.css');   

async function GenerateCard(Player, generateImage)
{ 
    const html = `<html>
    <head>
        <meta name="color-scheme" content="light dark">
        <style>${style}</style>
    </head>
    <body>
    
        <div id="Player-card" class="${Player.Card.Classes}";>
    
        <div style="color:;" class="pcdisplay-rat">${Player.Ovr}</div>
        <div style="color:;" class="pcdisplay-name">${Player.Name}</div>
        <div style="color:;" class="pcdisplay-pos">${Player.Position}</div>
        
        <div class="pcdisplay-country">
            <img alt="n" id="player_nation" src="${Player.Country}">
        </div>
        <div class="pcdisplay-club">
            <img alt="c" id="player_club" src="${Player.Club}">
        </div>
        
        <div class="pcdisplay-alt-pos"></div>
        <div class="pcdisplay-picture ${Player.Picture.IsSpecial ? "special-img" : "" }">
            <img class="pcdisplay-picture-width" id="player_pic" src="${Player.Picture.Image}">
        </div>
                            
        <div class="horz-line top-one-horz-line"></div>
        <div class="horz-line top-two-horz-line"></div>
        <div class="vert-line"></div>
        <div class="horz-line"></div>
        <div class="horz-line horz-line-bottom"></div>
        <div class="item-brush"></div>
        <!-- card stats start -->
        <div class="ovrhover">
            <div class="pcdisplay-ovr1 stat-val" data-stat="pace">${Player.PAC}</div>
            <div class="pcdisplay-card-pace">PAC</div>

            
            <div class="pcdisplay-ovr2 stat-val" data-stat="shooting">${Player.SHO}</div>
            <div class="pcdisplay-card-shoo">SHO</div>

            
            <div class="pcdisplay-ovr3 stat-val" data-stat="passing">${Player.PAS}</div>
            <div class="pcdisplay-card-pas"> PAS</div>

            
            <div class="pcdisplay-ovr4 stat-val" data-stat="dribblingp">${Player.DRI}</div>
            <div class="pcdisplay-card-dri"> DRI</div>

            
            <div class="pcdisplay-ovr5 stat-val" data-stat="defending">${Player.DEF}</div>
            <div class="pcdisplay-card-def"> DEF</div>

            
            <div class="pcdisplay-ovr6 stat-val" data-stat="heading">${Player.PHY}</div>
            <div class="pcdisplay-card-phy"> PHY</div>
            
            <div class="pcdisplay-chem-style-name"></div>
        </div>
        <!-- card stats end -->
        </div>
    </body></html>`

    return generateImage ? await PuppeteerFuncs.HtmlToPng(html, "#Player-card") : html
}


exports.GenerateCard = GenerateCard