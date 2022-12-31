const cheerio = require('cheerio');
const express = require('express');

const CardGenerator = require("./cardGenerator.js")
const PuppeteerFuncs = require("./PuppeteerFuncs.js")

var SBC_STYLE = ""
var fs = require('fs');

class SBC
{
  constructor(NOME, IsNew, CoverImage, IsPlayer, Rewards) {
    this.Name = NOME
    this.IsNew = IsNew
    this.CoverImage = CoverImage
    this.IsPlayer = IsPlayer
    this.Rewards = Rewards
  }
}

class PlayerCard
{
  constructor(Card, Name, Ovr, Position, Country, Club, Picture, PAC, SHO, PAS, DRI, DEF, PHY) {
    this.Card = Card
    this.Name = Name
    this.Ovr = Ovr
    this.Position = Position
    this.Country = Country
    this.Club = Club
    this.Picture = Picture
    this.PAC = PAC
    this.SHO = SHO
    this.PAS = PAS
    this.DRI = DRI
    this.DEF = DEF
    this.PHY = PHY
  }

  async GenerateCard() {
    if(this.GeneratedCard == undefined){
      this.GeneratedCard = await CardGenerator.GenerateCard(this, true)
    }

    return this.GeneratedCard
  }
}

class Player
{
  constructor(Id, PlayerCard, PlayerVersions)
  {
    this.Id = Id
    this.PlayerCard = PlayerCard
    this.PlayerVersions = PlayerVersions
  }
}

var SBCs = []
var Players = []

const app = express();
app.get('/', (req, res) => {
  console.log("SBCS")
  res.send({data : SBCs})  
});

app.get('/player', async (req, res) => {
  console.log("player")
    if(req.query.id != undefined)
    {
      var generateImage = (req.query.generateImage === undefined || req.query.generateImage.toLowerCase() === 'false' ? false : true)

      _Player = await GeneratePlayer(req.query.id)

      if(req.query.version != undefined)
      {
        if(_Player.PlayerVersions.length > req.query.version){
          const id = _Player.PlayerVersions[req.query.version]
          _Player = await GeneratePlayer(id)
        }
      }

      if(generateImage)
      {
        res.writeHead(200, { 'Content-Type': 'image/png' });
        res.end(await _Player.PlayerCard.GenerateCard(), 'binary');
      }else
        res.send(await CardGenerator.GenerateCard(_Player.PlayerCard, false))
    }
});

async function GeneratePlayer(id)
{
  var _Player = Players.find(element => element.Id == id)
  if(_Player == undefined)
  {
    await PuppeteerFuncs.GetUrl(`https://www.futbin.com/23/player/${id}`).then(async c => {
      const $ = cheerio.load(c);
      const playerElement = $('#Player-card')

      const playerCard = BuildCardStats($, playerElement)
      
      const playerVersions = $('.player-versions');
      
      var versions = []
      $(playerVersions).find(".pversion").each(function(i, element) {
        var id = $(element).find('a').attr('href').substring(1).split('/')[2]
        versions.push(id)
      })

      _Player = new Player(id, playerCard, versions)
      Players.push(_Player)
    });
  }
    
  return _Player;
}

async function LoadSBCs(c){
  const $ = cheerio.load(c);
  
  $('div.sbc_set_box').each(async function(i, element) {
    const IsPlayer = $(element).find('.rewards_area ').find('#Player-card').length > 0;

    const sbc = new SBC(
      $(element).find('.set_name').text().trim(),
      $(element).find('.new_player_text').length > 0,
      $(element).find('.set_image').find('img').attr('data-original'),
      IsPlayer,
      null
    )

    if(IsPlayer)
    {
      const playerElement = $(element).find('.rewards_area ').find('#Player-card')
      
      sbc.Rewards = BuildCardStats($, playerElement)
    }

    SBCs.push(sbc);
  });
}

function BuildCardStats($, playerElement)
{
  const ovrElement = $(playerElement).find('.ovrhover')

  return new PlayerCard(
    {Classes: $(playerElement).attr('class')},
    $(playerElement).find('.pcdisplay-name').text(),
    $(playerElement).find('.pcdisplay-rat').text(),
    $(playerElement).find('.pcdisplay-pos').text(),
    $(playerElement).find('.pcdisplay-country').find('img').attr('data-original') || $(playerElement).find('.pcdisplay-country').find('img').attr('src'),
    $(playerElement).find('.pcdisplay-club').find('img').attr('data-original') || $(playerElement).find('.pcdisplay-club').find('img').attr('src'),
    {IsSpecial: $(playerElement).find('.pcdisplay-picture').hasClass("special-img"), Image: $(playerElement).find('.pcdisplay-picture').find('img').attr('data-original') || $(playerElement).find('.pcdisplay-picture').find('img').attr('src')},
    $(ovrElement).find('.pcdisplay-ovr1').text(),
    $(ovrElement).find('.pcdisplay-ovr2').text(),
    $(ovrElement).find('.pcdisplay-ovr3').text(),
    $(ovrElement).find('.pcdisplay-ovr4').text(),
    $(ovrElement).find('.pcdisplay-ovr5').text(),
    $(ovrElement).find('.pcdisplay-ovr6').text(),
  )
  
}

async function InitialLoad()
{
  console.log("INIT...")
  const [page_content, style] = await PuppeteerFuncs.GetUrlAndStyle('https://www.futbin.com/squad-building-challenges');
  SBC_STYLE = style;
  
//  fs.writeFile('./styles.css', style, function(err) {})
  try {
    await LoadSBCs(page_content);
    app.listen(3001, () => {
      console.log('listening on port 3001');
    });
  } catch (error) {
    InitialLoad();
  }
}

InitialLoad();