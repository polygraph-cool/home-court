var teamSelected = "All NBA"
var dateLow = 20150300;
var dateHigh = 20170200;

queue()
  .defer(d3.csv, "https://pudding.cool/2017/02/two-minute-report/assets/data/web_embed-teams.csv") // 67KB
  .await(ready);

function ready(error
  ,teams_data
){

  var comma = d3.format(",")
  var container = d3.select(".call-container");

  var callType = d3.nest().key(function(d){
      return d.review_decision;
    })
    .entries(teams_data)
    ;

  var uniqueDates = d3.nest().key(function(d){
      return d.date.slice(0,6);
    })
    .entries(teams_data)
    ;

  var dateExtent = d3.extent(uniqueDates,function(d){
    return d.key;
  })

  var titleContainer = container.append("div")
    .attr("class","call-container-title-container")

  titleContainer.append("p")
    .attr("class","call-container-title-big")
    .html("Home Court Advantage by Referees&rsquo; Calls")
    ;

  var titleContainerSub = titleContainer.append("div")
    .attr("class","call-container-title-sub-container")
    ;

  var firstDate = titleContainerSub.append("select")
    .attr("class","call-container-title-date-drop")
    .on("change",function(d){
      var itemSelected = d3.select(this).node().value;
      var date = itemSelected.slice(-4)+itemSelected.slice(0,2);
      dateLow = +date*100;
      updateChart(teamSelected);
    })
    ;

  var titleContainerSubText = titleContainerSub.append("p")
    .attr("class","call-container-title-sub")
    .text(function(d){
      return " to ";
    })
    ;

  var secondDate = titleContainerSub.append("select")
    .attr("class","call-container-title-date-drop")
    .on("change",function(d){
      var itemSelected = d3.select(this).node().value;
      var date = itemSelected.slice(-4)+itemSelected.slice(0,2);
      dateHigh = +date*100;
      updateChart(teamSelected);
    })
    ;
    ;

  var titleContainerSubText = titleContainerSub.append("p")
    .attr("class","call-container-title-sub")
    .text(function(d){
      return " for ";
    })
    ;

  firstDate.selectAll("option")
    .data(uniqueDates)
    .enter()
    .append("option")
    .attr("selected",function(d){
      if(+d.key*100==dateLow){
        return true;
      }
      return null;
    })
    .attr("class","call-container-title-drop-item")
    .text(function(d){
      return d.key.slice(-2)+"/"+d.key.slice(0,4);
    })
    ;

  secondDate.selectAll("option")
    .data(uniqueDates)
    .enter()
    .append("option")
    .attr("class","call-container-title-drop-item")
    .attr("selected",function(d){
      if(+d.key*100==dateHigh){
        return true;
      }
      return null;
    })
    .text(function(d){
      return d.key.slice(-2)+"/"+d.key.slice(0,4);
    })
    ;

  var teams = [
    "All NBA","ATL","BKN","BOS","CHA","CHI","CLE","DAL","DEN","DET","GSW","HOU","IND","LAC","LAL","MEM","MIA","MIL","MIN","NOP","NYK","OKC","ORL","PHI","PHO","POR","SAC","SAS","TOR","UTA","WAS"
  ];

  var titleContainerSubTeam = titleContainerSub.append("select")
    .attr("class","call-container-title-drop")
    .on("change",function(d){
      var itemSelected = d3.select(this).node().value;
      teamSelected = itemSelected
      updateChart(itemSelected);
    })
    ;

  var titleContainerSubEnd = titleContainerSub.append("p")
    .attr("class","call-container-title-end")
    .text(function(d){
      return "";
    })
    ;

  function updateChart(teamSelected){

    titleContainerSubEnd
      .text(function(d){
        if(teamSelected == "All NBA"){
          return "";
        }
        return "home games"
      })
      ;

    containerRow.each(function(d){
      var calc;
      if(teamSelected == "All NBA"){
        calc = d.values.filter(function(d){
          return +d.date > dateLow && +d.date < dateHigh && d.committing_team != "";
        });
      }
      else{
        calc = d.values.filter(function(d){
          return d.home == teamSelected && +d.date > dateLow && +d.date < dateHigh && d.committing_team != "";
        });
      }
      var home = 0;
      var away = 0;
      for (var item in calc){
        if(calc[item].home==calc[item].committing_team){
          if(d.key=="CC" || d.key == "IC"){
            away++
          }
          else{
            home++
          }
        }
        else{
          if(d.key=="CC" || d.key == "IC"){
            home++
          }
          else{
            away++
          }
        }
      }
      d.home = home;
      d.away = away;
    })
    ;

    homeDiv.style("width",function(d){
        return d.home/(d.home+d.away)*100 +"%";
      })
      .style("background-color",function(d){
        if(d.home/(d.home+d.away)>.5){
          return positiveScale(d.home/(d.home+d.away))
        }
        return negativeScale(d.home/(d.home+d.away));
      })
      ;

    homeDivCallCount
      .html(function(d){
        return comma(d.home)+" calls";
      })
      ;

    homeDivCallPercent
      .style("color",function(d){
        if(d.home/(d.home+d.away)>.5){
          return "#0b4a3f";
        }
        if(d.home/(d.home+d.away)==.5){
          return "black"
        }
        return "#731511";
      })
      .html(function(d){
        if(teamSelected != "All NBA"){
          return "<span>"+teamSelected+ " at home</span> - "+Math.round(d.home/(d.home+d.away)*100)+"%";
        }
        return "<span>Home team</span> - "+Math.round(d.home/(d.home+d.away)*100)+"%";
      })
      ;

    awayDiv.style("width",function(d){
        return d.away/(d.home+d.away)*100 +"%";
      })
      .style("background-color",function(d){
        if(d.away/(d.home+d.away)>.5){
          return positiveScale(d.away/(d.home+d.away))
        }
        return negativeScale(d.away/(d.home+d.away));
      })
      ;

    awayDivCallCount
      .html(function(d){
        return comma(d.away)+" calls";
      })
      ;

    awayDivCallPercent
      .style("color",function(d){
        if(d.away/(d.home+d.away)>.5){
          return "#0b4a3f";
        }
        if(d.home/(d.home+d.away)==.5){
          return "black"
        }
        return "#731511";
      })
      .html(function(d){
        return Math.round(d.away/(d.home+d.away)*100)+"% - <span>Away team</span>";
      })
      ;

  }

  titleContainerSubTeam
    .selectAll("option")
    .data(teams)
    .enter()
    .append("option")
    .attr("class","call-container-title-drop-item")
    .text(function(d){
      return d;
    })
    ;

  var containerRow = container.append("div")
    .attr("class","call-container-wrapper")
    .selectAll("div")
    .data(callType)
    .enter()
    .append("div")
    .attr("class","call-container-row")
    .each(function(d){
      calc = d.values.filter(function(d){
        return +d.date > dateLow && +d.date < dateHigh && d.committing_team != "";
      });
      var home = 0;
      var away = 0;
      for (var item in calc){
        if(calc[item].home==calc[item].committing_team){
          if(d.key=="CC" || d.key == "IC"){
            away++
          }
          else{
            home++
          }
        }
        else{
          if(d.key=="CC" || d.key == "IC"){
            home++
          }
          else{
            away++
          }
        }
      }
      d.home = home;
      d.away = away;
    })
    ;

  var callKey = {
    "CC":"<p class='big'>Team benefiting from <u>correct calls</u></p><p class='small'>Refs correctly called an infraction against the other team</p>",
    "IC":"<p class='big'>Team benefiting from <u>incorrect calls</u></p><p class='small'>Refs screwed up – called an infraction on the other team</p>",
    "INC":"<p class='big'>Team benefiting from missed calls, an <u>incorrect no-call</u></p><p class='small'>Refs let team get away with infraction</p>"
  }

  containerRow.append("div")
    .attr("class","call-container-row-label")
    .html(function(d){
      return callKey[d.key];
    })
    ;

  var positiveScale = d3.scaleLinear().domain([.5,.6]).range(["rgb(238, 238, 238)","rgb(112, 194, 180)"]).clamp(true);
  var negativeScale = d3.scaleLinear().domain([.4,.5]).range(["rgb(224, 108, 123)","rgb(238, 238, 238)"]).clamp(true);

  var homeDiv = containerRow.append("div")
    .attr("class","call-container-row-count-wrapper")
    .style("background-color",function(d){
      if(d.home/(d.home+d.away)>.5){
        return positiveScale(d.home/(d.home+d.away))
      }
      return negativeScale(d.home/(d.home+d.away));
    })
    .style("width",function(d){
      return d.home/(d.home+d.away)*100 +"%";
    })
    ;

  var homeDivCallCount = homeDiv.append("p")
    .attr("class","call-container-row-count call-container-row-count-home")
    .html(function(d){
      return comma(d.home)+" calls";
    })
    ;

  var homeDivCallPercent = homeDiv.append("p")
    .attr("class","call-container-row-percent call-container-row-percent-home")
    .style("color",function(d){
      if(d.home/(d.home+d.away)>.5){
        return "#0b4a3f";
      }
      return "#731511";
    })
    .html(function(d){
      return "<span>Home team</span> - "+Math.round(d.home/(d.home+d.away)*100)+"%";
    })
    ;

  var awayDiv = containerRow.append("div")
    .attr("class","call-container-row-count-wrapper")
    .style("background-color",function(d){
      if(d.away/(d.home+d.away)>.5){
        return positiveScale(d.away/(d.home+d.away))
      }
      return negativeScale(d.away/(d.home+d.away));
    })
    .style("width",function(d){
      return d.away/(d.home+d.away)*100 +"%";
    })

  var awayDivCallCount = awayDiv.append("p")
    .attr("class","call-container-row-count call-container-row-count-away")
    .html(function(d){
      return comma(d.away)+" calls";
    })
    ;

  var awayDivCallPercent = awayDiv.append("p")
    .attr("class","call-container-row-percent call-container-row-percent-away")
    .style("color",function(d){
      if(d.away/(d.home+d.away)>.5){
        return "#0b4a3f";
      }
      return "#731511";
    })
    .html(function(d){
      return Math.round(d.away/(d.home+d.away)*100)+"% - <span>Away team</span>";
    })
    ;

  var embed = container.append("div")
    .attr("class","call-container-embed")
    ;

  var embedLeft = embed.append("div")
    .attr("class","call-container-embed-left")

  var embedRight = embed.append("p")
      .attr("class","call-container-embed-right")
      .html(function(d){
        return "from <a href='https://pudding.cool'>The Pudding</a> crew";
      })


  embedLeft
    .append("p")
    .attr("class","call-container-embed-text")
    .text("Embed this chart:")
    ;

  embedLeft.append("input")
    .attr("class","call-container-embed-input")
    .attr("readonly",true)
    .attr("value","https://pudding.cool/2017/03/home-court/calls.html")
    ;

}
