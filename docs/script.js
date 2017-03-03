queue()
  .defer(d3.csv, "home.csv") // 67KB
  .await(ready);

function ready(error
  ,home
){
  function topChart(){

    var mobile = false;

    if( /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
      mobile = true;
    }


    var leagues = ["NBA","NHL","NFL","MLB"]
    var container = d3.select(".top-slang-section-table");

    var leagueContainer = container.selectAll("div")
      .data(leagues)
      .enter()
      .append("div")
      .attr("class","league-column")
      ;



    var yearExtent = d3.extent(home,function(d){
      return d.Year;
    })

    var yearScale = d3.scaleLinear().domain(yearExtent).range([0,100]).clamp(true);
    var winScale = d3.scaleLinear().domain([.46,.76]).range([100,0]).clamp(true);
    leagueContainer.append("p")
      .attr("class","league-column-chart-title")
      .text(function(d){
        return d;
      })
      ;
    var leagueContainerChart = leagueContainer.append("div")
      .attr("class","league-column-chart")
      ;

    var leagueDots = leagueContainerChart
      .selectAll("div")
      .data(function(d){
        var league = d;
        var data = home.map(function(d){
          var point = {year:+d.Year,percent:d[league]};
          return {year:+d.Year,percent:+d[league]};
        }).filter(function(d){
          return +d.percent > 0;
        })
        return data;
      })
      .enter()
      .append("div")
      .attr("class","league-column-chart-dot")
      .style("left",function(d){
        return yearScale(+d.year)+"%"
      })
      .style("top",function(d){
        return winScale(+d.percent)+"%"
      })
      ;

    leagueDots.filter(function(d){
        return +d.percent > .73;
      })
      .style("background-color","#3c3c3c")
      .append("div")
      .attr("class","league-annotation-line")
      .append("p")
      .attr("class","league-annotation-text")
      .text("NBA in 1950: home teams won 74% of their games")
      ;

    leagueContainer.append("div")
      .attr("class","league-column-chart-half-line")
      .style("top",function(d){
        return winScale(.5)+"%"
      })
      ;

    leagueContainer.append("div")
      .attr("class","league-column-chart-grid-container")
      .selectAll("div")
      .data([.475,.525,.55,.575,.60,.625,.65,.675,.7,.725,.75])
      .enter()
      .append("div")
      .attr("class","league-column-chart-grid-line")
      .style("top",function(d){
        return winScale(d)+"%"
      })
      ;

    leagueContainer.append("div")
      .attr("class","league-column-chart-x-axis")
      .selectAll("div")
      .data([1900,1925,1950,1975,2000])
      .enter()
      .append("div")
      .attr("class","league-column-chart-x-axis-line")
      .style("left",function(d){
        return yearScale(+d)+"%"
      })
      .append("p")
      .attr("class","league-column-chart-x-axis-text")
      .text(function(d,i){
        if(mobile){
          if(i==2 || i==4){
            return d;
          }
          return "";
        }
        return d;
      })
      ;

    container.append("p")
      .attr("class","league-x-axis")
      .text("Year")
      ;

    var yAxis = leagueContainer.filter(function(d,i){
      return i==0
      }).append("div")
      .attr("class","league-y-axis")

    yAxis
      .append("div")
      .attr("class","league-y-axis-container")
      .selectAll("div")
      .data([.475,.525,.50,.55,.575,.60,.625,.65,.675,.7,.725,.75])
      .enter()
      .append("div")
      .attr("class","league-y-axis-item")
      .style("top",function(d){
        return winScale(+d)+"%"
      })
      .style("border-top",function(d){
        if(d==.5){
          return "3px solid rgb(49, 90, 199)";
        }
        return null;
      })
      .append("p")
      .attr("class","league-y-axis-text")
      .html(function(d){
        if(d==.5){
          return Math.round(d*100)+"% <span>no home advantage</span>";
        }
        return Math.round(d*100)+"%";
      })
      .style("color",function(d){
        if(d==.5){
          return "rgb(49, 90, 199)";
        }
        return null;
      })
      .style("font-size",function(d){
        if(d==.5){
          return "14px";
        }
        return null;
      })
      ;

    yAxis.append("p")
      .attr("class","league-y-axis-wide")
      .text("Home Team Winning %")
      ;





  }
  topChart();

}
