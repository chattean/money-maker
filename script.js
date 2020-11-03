// Element variable declartions
var stockCardEl = document.querySelector(".stock-card")
var companyInfoEl = document.querySelector(".company-info");
var stockCurrentEl = document.querySelector(".stock-current");
var stockPreviousEl = document.querySelector(".stock-previous");
var companyUrlEl = document.querySelector(".website");
var newsFeedEl = document.querySelector(".news-feed");
var stockNewsEl = document.querySelector(".stockNews");

var previousStockTickersEl = document.querySelector(".search-results");
var addToWatchedEl = document.createElement("a");

// getting data from localStorage or default values
var stockTickers = JSON.parse(localStorage.getItem("stock-tickers")) || [];
var stockTickersDefault = ['AAPL'];

var displayPreviousStockTickers = function (stockTickers) {
    for (var i = 0; i < stockTickers.length; i++) {
        var previousStockTicker = document.createElement("ul");
        previousStockTicker.innerHTML = "<li>" + stockTickers[i] + "</li>";
        previousStockTickersEl.appendChild(previousStockTicker);
    }
};

displayPreviousStockTickers(stockTickers);

var storeStockTickers = function (stockTicker) {
    if (!stockTickers.includes(stockTicker)) {
        stockTickers.push(stockTicker);
        localStorage.setItem("stock-tickers", JSON.stringify(stockTickers));
        previousStockTickersEl.textContent = "";
        displayPreviousStockTickers(stockTickers);
    }
    // TO DO: add limit of 10 tickers
};

// calling bloomberg market new end point through rapidapi to render at the botton of the page
var getRapidApiNews = function () {
    fetch("https://bloomberg-market-and-financial-news.p.rapidapi.com/stories/list?template=STOCK&id=usdjpy", {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "bloomberg-market-and-financial-news.p.rapidapi.com",
            "x-rapidapi-key": "8a1f46e1d8msh570b0c0e9eeb024p19ee6bjsn73741d7971e8"
        }
    }).then(function (response) {
        response.json().then(function (data) {
            console.log("this is rapidApi: ", data.stories);
            if (data.stories) {
                for (var i = 0; i < 6; i++) {
                    var newsImage = data.stories[i].thumbnailImage;
                    var newsHeadline = data.stories[i].title;
                    var newsUrl = data.stories[i].shortURL;

                    var newsImageEl = document.createElement("div");
                    newsImageEl.classList = "card-stacked small col s2";
                    newsImageEl.innerHTML = "<div class='card-image article-image'><img src='" +
                        newsImage + "' class='responsive-img'/></div>";

                    var newsTitleEl = document.createElement("div");
                    newsTitleEl.classList = "action-card article-link";
                    newsTitleEl.innerHTML = "<a href='" + newsUrl + "' target='_blank'>" + newsHeadline + "</a>";
                    newsImageEl.appendChild(newsTitleEl);
                    newsFeedEl.appendChild(newsImageEl);
                }
            }
        })
    })
}

// TO DO: dynamically render dates based on user's input
var getNewsData = function (stockTicker) {
    var st = stockTicker;
    let now = moment();
    //debugger;
    var mainDate = now.format("YYYY-MM-DD");
    //var mainDate = moment('today', 'YYYY-MM-DD');
    var oldDate = moment().subtract('days', 7).format('YYYY-MM-DD');
    var newsURL = "https://finnhub.io/api/v1/company-news?symbol=" + stockTicker + "&from=" + oldDate + "&to=" + mainDate + "&token=bufqlff48v6veg4jhmcg";
    
    fetch(newsURL)
       .then(function(response) 
         {
            if (response.ok) 
           {
            response.json().then(function(data){
                    //alert("successful");
                //console.log(data);
                displayNewsData(data);
                });
           } 
           else 
           {
               alert("Error: " + response.statusText);
           }
       })
       .catch(function(error) 
       {
           // Notice this `.catch()` getting chained onto the end of the `.then()` method
           alert("Unable to connect to API");
       });             
};

var getStockPrices = function (stockTicker) {
    fetch("https://finnhub.io/api/v1/quote?symbol=" + stockTicker + "&token=bubka1v48v6ouqkj675g").then(function (response) {
        response.json().then(function (data) {
            // console.log("Stock Prices API call: ", data);

            // move to a seperate function
            stockCurrentEl.innerHTML = "";
            var currentPriceEl = document.createElement("td");
            currentPriceEl.textContent = Math.round(data.c * 100) / 100;
            stockCurrentEl.appendChild(currentPriceEl);

            // move to a seperate function
            stockPreviousEl.innerHTML = "";

            var previousPriceEl = document.createElement("td");
            previousPriceEl.textContent = Math.round(data.pc * 100) / 100;
            stockPreviousEl.appendChild(previousPriceEl);

            // save stock ticker in local storage
            storeStockTickers(stockTicker);

        })
    })
};

// This Function is called when search is clicked.
// This is dynamically run with the value of the #search field elemnet

var getCompanyData = function (stockTicker) {
    fetch("https://finnhub.io/api/v1/stock/profile2?symbol=" + stockTicker + "&token=bubka1v48v6ouqkj675g")
        .then(function (stockResponse) {
            return stockResponse.json();
        })
        .then(function (data) {
            // Error Checking if search box is empty or invalid
            if (data.name ==undefined || data.name == null|| data.name== "" ){
                console.log("data is empty")
                $('#error-msg').empty();
                var errorMsg = $('#error-msg')
                var displayError = document.createElement('p');
                displayError.setAttribute('style','color:red');
                displayError.innerHTML = "Please enter a valid Stock Ticker";
                errorMsg.append(displayError);
            }else{
                // initializing the innerHTMLs of all elements

                companyInfoEl.innerHTML = "";
                companyUrlEl.innerHTML = "";
                $('#error-msg').empty();

                // button to add to favorite -- add event listner *******NICE TO HAVE add later***********
                // addToWatchedEl.classList = "btn-small btn-floating halfway-fab waves-effect waves-light red";
                // addToWatchedEl.innerHTML = "<i class ='small material-icons'>add</i>";
                // stockCardEl.appendChild(addToWatchedEl);

                //getting the company logo
                var companyLogoEl = document.createElement("th")
                companyLogoEl.setAttribute('class', 'card-image company-logo')
                var logoImgEl = document.createElement("img");
                logoImgEl.setAttribute('src', data.logo);
                logoImgEl.setAttribute('class', 'responsive-img');
                logoImgEl.setAttribute('alt', 'logo');
                companyLogoEl.append(logoImgEl);
                companyInfoEl.appendChild(companyLogoEl);

                //Display Company Name
                var nameEl = document.createElement("th");
                nameEl.setAttribute('style', 'text-align: center')
                nameEl.textContent = data.name;
                companyInfoEl.appendChild(nameEl);

                //Display Stock Ticker

                var symbolEl = document.createElement("th");
                symbolEl.textContent = data.ticker;
                companyInfoEl.appendChild(symbolEl);

                //function to generate the current and Open price
                getStockPrices(stockTicker);

                // console.log(stockTicker);

                //Display Website URL 
                var webUrlEl = document.createElement("td");
                webUrlEl.innerHTML = "<a href='" + data.weburl + "'>" + data.name;
                companyUrlEl.appendChild(webUrlEl);
            }
        })
};

// rendering stored list of stock tickers from local storage, starting with one value
var renderStoredStockTickers = function (i = 0) {

    if (stockTickers.length === 0) {
        //for (var i = 0; i < stockTickersDefault.length; i++) {
        getCompanyData(stockTickersDefault[i]);
        //}
    } else {
        //for (var i = 0; i < stockTickers.length; i++) {
        getCompanyData(stockTickers[i])
        //}
    }
}

renderStoredStockTickers();

var previousStockTickersHandler = function (event) {
    var stockTickerSelected = event.target.textContent;
    getCompanyData(stockTickerSelected);
};

// Event Listener for the search icon, when clicked will run the getCompanyData function to display stock information.

$(document).on('click', '.search-icon', function () {
    // getting the search value. 
    var stockTicker = document.querySelector("#search").value;
    console.log("this is from click: ", stockTicker)
    getCompanyData(stockTicker);
    // add function for getting stock news
    getNewsData(stockTicker); 
});

// Event Listener for the search icon, when enter is pressed it  will run the getCompanyData function to display stock information.


$(document.querySelector("#search")).keypress(function (e) { 
    if (e.which == 13) { // code 13 is enter in most browsers
            // getting the search value. 
        var stockTicker = document.querySelector("#search").value;
        console.log("this is from click: ", stockTicker)
        getCompanyData(stockTicker);
        // add function for getting stock news
        getNewsData(stockTicker); 

    }
    
});
// render stock clicked from previous searched side-nav
previousStockTickersEl.addEventListener("click", previousStockTickersHandler);


// This shows up as default on the page before the page is cleared to have a search result. 
getCompanyData('AAPL');
// getCompanyData('AMZN');
// getCompanyData('TSLA');
// getNewsData(); 

getRapidApiNews();


// initliaze interactive elements materialize
$(document).ready(function () {
    $('.sidenav').sidenav();
});

//display News Data
var displayNewsData = function(data)
 {
    //console.log(data);

    var results = data.list;
    //debugger;
    // alert("successful");
    // debugger;
    stockNewsEl.innerHTML = "";
    if (data.length === 0) 
    {
        stockNewsEl.textContent = "No data found.";
        return;
    }
    for (var i = 0; i < 4; i++) 
    {
    var newsEl = document.createElement("div");
                    //stockNewsEl.classList = "card-img-top";
        newsEl.innerHTML = "<img class='responsiv-img' src='" + data[i].image + "' alt='news'><span class='card-title>" + data[i].headline + '</span>';
                    //stockNewsEl.appendChild(newsEl);
    //var stockNewsBodyEL =  document.createElement("div");
                    //stockNewsBodyEL.classList = "card-img-top";               
                    //var newsUrlEl = document.createElement("p");
                    //newsUrlEl.innerHTML = "<a href='" + data[i].url + "'>";
                    //newsEl.append(newsUrlEl);
                    stockNewsEl.appendChild(newsEl);
    }
 }