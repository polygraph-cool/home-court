(function() {
  var dateLow = 20150300;
  var dateHigh = 20170200;
  var url = "https://pudding.cool/2017/02/two-minute-report/assets/data/web_embed-teams--incorrect.csv";
  var teams_data = null
  var container = d3.select(".team-container");
  var positiveScale = d3.scaleLinear().domain([.5,.6]).range(["rgb(238, 238, 238)","rgb(112, 194, 180)"]).clamp(true);
  var negativeScale = d3.scaleLinear().domain([.4,.5]).range(["rgb(224, 108, 123)","rgb(238, 238, 238)"]).clamp(true);
  var comma = d3.format(",")

  function loadData(cb) {
    d3.csv(url, cb)
  }

  function setupChart() {

    var realCallType = d3.nest().key(function (d) {
      return d.home;
    }).rollup(function (values) {
      var home = values.filter(function (v) {
        return v.review_decision === 'INC' &&
        v.committing_team === v.home ||
        v.review_decision === 'IC' &&
        v.disadvantaged_team === v.home;
      });

      var away = values.filter(function (v) {
        return v.review_decision === 'INC' &&
        v.committing_team === v.away ||
        v.review_decision === 'IC' &&
        v.disadvantaged_team === v.away;
      });

      return { home: home, away: away };
    }).entries(teams_data);
    
    var callType = d3.nest().key(function(d){
        return d.home;
      })
      .key(function(v){
        var benefiting;
        
        if(v.review_decision === 'INC' && v.committing_team === v.home || v.review_decision === 'IC' && v.disadvantaged_team === v.home){
          benefiting = 1;
        }
        if(v.review_decision === 'INC' && v.committing_team === v.away || v.review_decision === 'IC' && v.disadvantaged_team === v.away){
          benefiting = 0
        }
        return benefiting
      })
      .sortKeys(function(a,b){
        return b - a;
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
      .attr("class","team-container-title-container")

    titleContainer.append("p")
      .attr("class","team-container-title-big")
      .html("Home Court Advantage, by Team")
      ;

    var titleContainerSub = titleContainer.append("div")
      .attr("class","team-container-title-sub-container")
      ;

    var titleContainerSubText = titleContainerSub.append("p")
      .attr("class","team-container-title-sub")
      .html(function(d){
        return "Mistakes by Refs for Team&rsquo;s Home Games, from ";
      })
      ;

    var firstDate = titleContainerSub.append("select")
      .attr("class","team-container-title-date-drop")
      .on("change",function(d){
        var itemSelected = d3.select(this).node().value;
        var date = itemSelected.slice(-4)+itemSelected.slice(0,2);
        dateLow = +date*100;
        updateChart();
      })
      ;

    var titleContainerSubText = titleContainerSub.append("p")
      .attr("class","team-container-title-sub")
      .text(function(d){
        return " to ";
      })
      ;

    var secondDate = titleContainerSub.append("select")
      .attr("class","team-container-title-date-drop")
      .on("change",function(d){
        var itemSelected = d3.select(this).node().value;
        var date = itemSelected.slice(-4)+itemSelected.slice(0,2);
        dateHigh = +date*100;
        updateChart();
      })
      ;
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
      .attr("class","team-container-title-drop-item")
      .text(function(d){
        return d.key.slice(-2)+"/"+d.key.slice(0,4);
      })
      ;

    secondDate.selectAll("option")
      .data(uniqueDates)
      .enter()
      .append("option")
      .attr("class","team-container-title-drop-item")
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

    var containerRow = container.append("div")
      .attr("class","team-container-wrapper")
      .selectAll("div")
      .data(realCallType)
      .enter()
      .append("div")
      .attr("class","team-container-row")
      .each(function(d){
        console.log(d)
        var calcHome = d.value.home.filter(function(d){
          return +d.date > dateLow && +d.date < dateHigh;
        });

        var calcAway = d.value.away.filter(function(d){
          return +d.date > dateLow && +d.date < dateHigh;
        });

        var home = d.value.home.length;
        var away = d.value.away.length;;
        d.home = home;
        d.away = away;
        d.percentSort = (home)/(home+away);
      })
      .sort(function(a,b){
        return b.percentSort - a.percentSort;
      })
      ;


    var logoContainer = containerRow.append("div")
      .attr("class","team-container-row-team")

    logoContainer
      .append("img")
      .attr("class","team__logo")
      .attr("src",function(d){
        return "https://pudding.cool/2017/02/two-minute-report/assets/logos/"+d.key+"@2x.jpg";
      })
      ;

    logoContainer
      .append("p")
      .attr("class","team__text")
      .text(function(d){
        return d.key;
      })
      ;

    var positiveScale = d3.scaleLinear().domain([.5,.6]).range(["rgb(238, 238, 238)","rgb(112, 194, 180)"]).clamp(true);
    var negativeScale = d3.scaleLinear().domain([.4,.5]).range(["rgb(224, 108, 123)","rgb(238, 238, 238)"]).clamp(true);
    //

    var teamAwayHomeCols = containerRow.append("div")
      .attr("class","team-container-row-breakdown")
      .selectAll("div")
      .data(function(d,i){
        return [{count:d.home,percent:d.home/(d.home+d.away)},{count:d.away,percent:d.away/(d.home+d.away)}];
      })
      .enter()
      .append("div")
      .style("width",function(d,i){
        return d.percent*100 +"%";
      })
      .style("background-color",function(d){
        if(d.percent>.5){
          return positiveScale(d.percent);
        }
        return negativeScale(d.percent);
      })
      .attr("class","team-container-row-breakdown-col")
      ;

    var teamAwayHomeColsCounts = teamAwayHomeCols.append("p")
      .attr("class",function(d,i){
        if(i==0){
          return "team-container-row-count team-container-row-count-home"
        }
        return "team-container-row-count team-container-row-count-away"
      })

      .html(function(d,i){
        var team = d3.select(this.parentNode.parentNode).datum().key;
        if(i==0){
          if(d.count == 1){
            return team+" benefited from "+comma(d.count) + " call"
          }
          return team+" benefited from "+comma(d.count) + " calls"
        }
        return "Opposition benefited from " + comma(d.count) + " calls";
      })
      .style("left",function(d,i){
        if(i==0){
          return "0px";
        }
        return "auto";
      })
      .style("text-align",function(d,i){
        if(i==0){
          return "left";
        }
        return "right";
      })
      .style("right",function(d,i){
        if(i==1){
          return "0px";
        }
        return "auto";
      })
      .style("color",function(d){
        if(d.percent>.5){
          return "#0b4a3f";
        }
        if(d.percent == .5){
          return "black";
        }
        return "#731511";
      })
      ;

    var teamAwayHomeColsPercents =teamAwayHomeCols.append("p")
      .attr("class","team-container-row-percent team-container-row-count-home")
      .html(function(d,i){
        // if(d.percent == .5){
        //   return "";
        // }
        return Math.round(d.percent*100) + "%";
      })
      .style("left",function(d,i){
        if(i==0){
          return "auto";
        }
        return "0px";
      })
      .style("text-align",function(d,i){
        if(i==0){
          return "right";
        }
        return "left";
      })
      .style("right",function(d,i){
        if(i==1){
          return "0px";
        }
        return "auto";
      })
      .style("color",function(d){
        if(d.percent>.5){
          return "#0b4a3f";
        }
        if(d.percent == .5){
          return "black";
        }
        return "#731511";
      })
      ;

    var embed = container.append("div")
      .attr("class","team-container-embed")
      ;

    var embedLeft = embed.append("div")
      .attr("class","team-container-embed-left")

    var embedRight = embed.append("p")
        .attr("class","team-container-embed-right")
        .html(function(d){
          return "from <a href='https://pudding.cool'>The Pudding</a> crew";
        })


    embedLeft
      .append("p")
      .attr("class","team-container-embed-text")
      .text("Embed this chart:")
      ;

    embedLeft.append("input")
      .attr("class","team-container-embed-input")
      .attr("readonly",true)
      .attr("value","https://pudding.cool/2017/03/home-court/team.html")
      ;
  }

    function updateChart(){
      var baseURL = "https://pudding.cool/2017/03/home-court/team.html"
      var embedVal = '?low=' + encodeURIComponent(dateLow) + '&high=' + encodeURIComponent(dateHigh);
      var embedURL = baseURL + embedVal
      container.select('.team-container-embed-input')
      .attr("value", embedURL)

      var containerRow = container.selectAll('.team-container-row')
      
      containerRow.each(function(d){
          var calcHome = d.value.home.filter(function(d){
            return +d.date > dateLow && +d.date < dateHigh;
          });

          var calcAway = d.value.away.filter(function(d){
            return +d.date > dateLow && +d.date < dateHigh;
          });

          var home = calcHome.length;
          var away = calcAway.length;

          d.home = home;
          d.away = away;

          if(d.home == 0 && d.away == 0){
            d.percent = 0;
          }
          else{
            d.percentSort = (home)/(home+away);
          }
        })
        .sort(function(a,b){
          return b.percentSort - a.percentSort;
        })
        ;

        var teamAwayHomeCols = containerRow.selectAll('.team-container-row-breakdown-col')
        teamAwayHomeCols.filter(function(d,i){
            return i==0;
          })
          .datum(function(d){
            var data = d3.select(this.parentNode).datum();
            d = data;
            if(d.home == 0 && d.away == 0){
              return {count:d.home,percent:.5}
            }
            return {count:d.home,percent:d.home/(d.home+d.away)}
          });

        teamAwayHomeCols.filter(function(d,i){
            return i==1;
          })
          .datum(function(d){
            var data = d3.select(this.parentNode).datum();
            d = data;
            if(d.home == 0 && d.away == 0){
              return {count:d.home,percent:.5}
            }
            return {count:d.away,percent:d.away/(d.home+d.away)}
          });

        teamAwayHomeCols
          .style("width",function(d,i){
            return d.percent*100 +"%";
          })
          .style("background-color",function(d){
            if(d.percent>.5){
              return positiveScale(d.percent);
            }
            return negativeScale(d.percent);
          })
          .attr("class","team-container-row-breakdown-col")
          ;

      teamAwayHomeCols.select('.team-container-row-count')
        .datum(function(d){
          var data = d3.select(this.parentNode).datum();
          return data;
        })
        .html(function(d,i){
          var team = d3.select(this.parentNode.parentNode).datum().key;
          if(i==0){
            if(d.count == 1){
              return team+" benefited from "+comma(d.count) + " call"
            }
            return team+" benefited from "+comma(d.count) + " calls"
          }
          return "Opposition benefited from " + comma(d.count) + " calls";
        })
        .style("color",function(d){
          if(d.percent>.5){
            return "#0b4a3f";
          }
          if(d.percent == .5){
            return "black";
          }
          return "#731511";
        })
        ;

      teamAwayHomeCols.select('.team-container-row-percent')
        .datum(function(d){
          var data = d3.select(this.parentNode).datum();
          return data;
        })
        .html(function(d,i){
          // if(d.percent == .5){
          //   return "";
          // }
          return Math.round(d.percent*100) + "%";
        })
        .style("color",function(d){
          if(d.percent>.5){
            return "#0b4a3f";
          }
          if(d.percent == .5){
            return "black";
          }
          return "#731511";
        })
        ;


    }



  function getUrlParameter(name) {
      name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
      var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
      var results = regex.exec(location.search);
      return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }

  function validDate(date) {
    var extent = d3.extent(teams_data, function(d) { return +d.date })
    var low = Math.floor(extent[0] / 100) * 100
    var high = Math.floor(extent[1] / 100) * 100
    // check that it is in range and ends in 00
    return +date >= low  && +date <= high
    && date.lastIndexOf('00') === 6
  }

  function parseQueryParams() {
    var low = getUrlParameter('low')
    var high = getUrlParameter('high')
    dateLow = low && validDate(low) ? +decodeURIComponent(low) : 20150300;
    dateHigh = high && validDate(high) ? +decodeURIComponent(high) : 20170200;
  }

  function init() {
    loadData(function(err, data) {
      teams_data = data
      parseQueryParams()
      setupChart()
      updateChart()
    })
  }

  init()

})()
