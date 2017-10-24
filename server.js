var express = require('express');
var fs      = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var artoo = require ('artoo-js');
var app     = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', function(req, res){

  const initialResultNb = 22420;
  var compareDate = new Date('2017-10-17');
  
  var currentDate;

  if(req.query.gameDate != undefined) {
    currentDate = new Date(req.query.gameDate);
  }
  else {
    currentDate = new Date();
    currentDate.setHours(0,0,0,0);
  }

  var diffDay = getDiffDay(compareDate,currentDate);
  console.log(compareDate);
  console.log(currentDate);
  console.log(diffDay);

  var finalScoreList = new Array();

  url = 'https://www.lequipe.fr/Basket/BasketResultat'+(initialResultNb+Number(diffDay))+'.html';
  //url = 'http://www.flashresultats.fr/basket/usa/nba/resultats/';

  request(url, function(error, response, html){
    if(!error){

      var $ = cheerio.load(html);
      artoo.setContext($);

      var scoreList = artoo.scrape('.ligne.bb-color', {
        homeTeam: {sel: '.equipeDom', method: 'text'},
        awayTeam: {sel: '.equipeExt', method: 'text'},
        homeScore: {sel: '.score--chiffre:nth-child(1)', method: 'text'},
        awayScore: {sel: '.score--chiffre:nth-child(2)', method: 'text'}
      });

      for(var i=0;i<scoreList.length;i++)
      {
        let scoreDiff = Number(scoreList[i].homeScore) - Number(scoreList[i].awayScore);

        let homeTeamInfo = getTeamInfo(scoreList[i].homeTeam.match(/[a-zA-Z\s]+/g)[0]);
        let awayTeamInfo = getTeamInfo(scoreList[i].awayTeam.match(/[a-zA-Z\s]+/g)[0]);

        let newScore = {
          homeTeam: homeTeamInfo.shortName,
          awayTeam: awayTeamInfo.shortName,
          homeTeamLogo: homeTeamInfo.logoURL,
          awayTeamLogo: awayTeamInfo.logoURL
        };

          switch(true)
          {
            case (scoreDiff <= 3):
              newScore.scoreDiff = "1-3 PTS";
              newScore.color = 'alert-success';
              break;
            case (scoreDiff > 3 && scoreDiff <= 6):
              newScore.scoreDiff = "4-6 PTS";
              newScore.color = 'alert-info';
              break;
            case (scoreDiff > 6 && scoreDiff <= 10):
              newScore.scoreDiff = "7-10 PTS";
              newScore.color = 'alert-warning';
              break;
            case (scoreDiff > 10 && scoreDiff <= 15):
              newScore.scoreDiff = "11-15 PTS";
              newScore.color = 'alert-danger';
              break;
            default:
              newScore.scoreDiff = "WHY NOT...";
              newScore.color = 'alert-secondary';
              break;
          }

        finalScoreList.push(newScore);
      }

      /*var scoreList = artoo.scrape('.stage-finished', {
        time: {sel: '.time', method: 'text'},
        teamHome: {sel: '.team-home', method: 'text'},
        teamAway: {sel: '.team-away', method: 'text'},
        score: {sel: '.score', method: 'text'}
      });

      console.log(scoreList);

      for(var i=0;i<scoreList.length;i++)
      {
        var scoreTab = scoreList[i].score.split(":");
        console.log(scoreTab);
        var diff = parseInt(scoreTab[0]) - parseInt(scoreTab[1]);

        switch(true)
        {
          case (diff <= 3):
            scoreList[i].score = "1-3 point game";
            break;
          case (diff > 3 && diff <= 6):
            scoreList[i].score = "4-6 points game";
            break;
          case (diff > 6 && diff <= 10):
            scoreList[i].score = "7-10 points game";
            break;
          case (diff > 10 && diff <= 15):
            scoreList[i].score = "11-15 points game";
            break;
          default:
            scoreList[i].score = "If you have time";
            break;
        }
      }*/
    }
    else
    {console.log("error : " + error);}

    fs.writeFile('output.json', JSON.stringify(finalScoreList, null, 4), function(err){
      console.log('File successfully written! - Check your project directory for the output.json file');
    })

    res.render("index", {finalScoreList : finalScoreList});
    //res.send('Check your console!')
  })
})


function getDiffDay(date1, date2)
{
  date1 = date1.getTime() / 86400000;
  date2 = date2.getTime() / 86400000;
  return new Number(date2 - date1).toFixed(0);
}


function getTeamInfo(teamName)
{
  console.log(teamName);
  
  let teamInfo = {};

  switch(true)
  {
    case teamName.toUpperCase().includes("HAWKS"):
      teamInfo.shortName='ATL';
      teamInfo.logoURL='images/logos/ATL_logo.svg';
      break;
    case teamName.toUpperCase().includes("CELTICS"):
      teamInfo.shortName='BOS';
      teamInfo.logoURL='images/logos/BOS_logo.svg';
      break;
    case teamName.toUpperCase().includes("BROOKLYN"):
      teamInfo.shortName='BKN';
      teamInfo.logoURL='images/logos/BKN_logo.svg';
      break;
    case teamName.toUpperCase().includes("CHARLOTTE"):
      teamInfo.shortName='CHA';
      teamInfo.logoURL='images/logos/CHA_logo.svg';
      break;
    case teamName.toUpperCase().includes("BULLS"):
      teamInfo.shortName='CHI';
      teamInfo.logoURL='images/logos/CHI_logo.svg';
      break;
    case teamName.toUpperCase().includes("CAVALIERS"):
      teamInfo.shortName='CLE';
      teamInfo.logoURL='images/logos/CLE_logo.svg';
      break;
    case teamName.toUpperCase().includes("MAVERICKS"):
      teamInfo.shortName='DAL';
      teamInfo.logoURL='images/logos/DAL_logo.svg';
      break;
    case teamName.toUpperCase().includes("NUGGETS"):
      teamInfo.shortName='DEN';
      teamInfo.logoURL='images/logos/DEN_logo.svg';
      break;
    case teamName.toUpperCase().includes("PISTONS"):
      teamInfo.shortName='DET';
      teamInfo.logoURL='images/logos/DET_logo.svg';
      break;
    case teamName.toUpperCase().includes("WARRIORS"):
      teamInfo.shortName='GSW';
      teamInfo.logoURL='images/logos/GSW_logo.svg';
      break;
    case teamName.toUpperCase().includes("ROCKETS"):
      teamInfo.shortName='HOU';
      teamInfo.logoURL='images/logos/HOU_logo.svg';
      break;
    case teamName.toUpperCase().includes("PACERS"):
      teamInfo.shortName='IND';
      teamInfo.logoURL='images/logos/IND_logo.svg';
      break;
    case teamName.toUpperCase().includes("CLIPPERS"):
      teamInfo.shortName='LAC';
      teamInfo.logoURL='images/logos/LAC_logo.svg';
      break;
    case teamName.toUpperCase().includes("LAKERS"):
      teamInfo.shortName='LAL';
      teamInfo.logoURL='images/logos/LAL_logo.svg';
      break;
    case teamName.toUpperCase().includes("GRIZZLIES"):
      teamInfo.shortName='MEM';
      teamInfo.logoURL='images/logos/MEM_logo.svg';
      break;
    case teamName.toUpperCase().includes("HEAT"):
      teamInfo.shortName='MIA';
      teamInfo.logoURL='images/logos/MIA_logo.svg';
      break;
    case teamName.toUpperCase().includes("BUCKS"):
      teamInfo.shortName='MIL';
      teamInfo.logoURL='images/logos/MIL_logo.svg';
      break;
    case teamName.toUpperCase().includes("TIMBERWOLVES"):
      teamInfo.shortName='MIN';
      teamInfo.logoURL='images/logos/MIN_logo.svg';
      break;
    case teamName.toUpperCase().includes("PELICANS"):
      teamInfo.shortName='NOP';
      teamInfo.logoURL='images/logos/NOP_logo.svg';
      break;
    case teamName.toUpperCase().includes("KNICKS"):
      teamInfo.shortName='NYK';
      teamInfo.logoURL='images/logos/NYK_logo.svg';
      break;
    case teamName.toUpperCase().includes("THUNDER"):
      teamInfo.shortName='OKC';
      teamInfo.logoURL='images/logos/OKC_logo.svg';
      break;
    case teamName.toUpperCase().includes("MAGIC"):
      teamInfo.shortName='ORL';
      teamInfo.logoURL='images/logos/ORL_logo.svg';
      break;
    case teamName.toUpperCase().includes("PHILA"):
      teamInfo.shortName='PHI';
      teamInfo.logoURL='images/logos/PHI_logo.svg';
      break;
    case teamName.toUpperCase().includes("SUNS"):
      teamInfo.shortName='PHX';
      teamInfo.logoURL='images/logos/PHX_logo.svg';
      break;
    case teamName.toUpperCase().includes("TRAIL BLAZERS"):
      teamInfo.shortName='POR';
      teamInfo.logoURL='images/logos/POR_logo.svg';
      break;
    case teamName.toUpperCase().includes("KINGS"):
      teamInfo.shortName='SAC';
      teamInfo.logoURL='images/logos/SAC_logo.svg';
      break;
    case teamName.toUpperCase().includes("SPURS"):
      teamInfo.shortName='SAS';
      teamInfo.logoURL='images/logos/SAS_logo.svg';
      break;
    case teamName.toUpperCase().includes("RAPTORS"):
      teamInfo.shortName='TOR';
      teamInfo.logoURL='images/logos/TOR_logo.svg';
      break;
    case teamName.toUpperCase().includes("JAZZ"):
      teamInfo.shortName='UTA';
      teamInfo.logoURL='images/logos/UTA_logo.svg';
      break;
    case teamName.toUpperCase().includes("WIZARDS"):
      teamInfo.shortName='WAS';
      teamInfo.logoURL='images/logos/WAS_logo.svg';
      break;
    default:
      teamInfo.shortName='NBA';
      teamInfo.logoURL='images/logos/NBA_logo.svg';
      break;

  }

  return teamInfo;
}


app.listen('8081')
console.log('Magic happens on port 8081');
exports = module.exports = app;
