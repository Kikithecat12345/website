const totalPriceEl = document.getElementById("game-price-total");
const gp = document.getElementsByClassName("game-price");

var priceData = [];

function loadPrices() {
  for (var i = 0; i < gp.length; i++) {
    var tick = {
      el: gp[i],
      gameId: gp[i].getAttribute("data-game-id"),
      price: parseFormattedPrice(gp[i].textContent),
    };
    priceData.push(tick);
    tick.el.setAttribute("data-original-price", tick.price);
    tick.el.setAttribute("title", "Original price: " + tick.price);
    tick.check = document.createElement("input");
    tick.check.setAttribute("type", "checkbox");
    tick.check.setAttribute("checked", "checked");
    tick.check.addEventListener("change", function () {
      updateTotalPrice();
    });
    tick.el.parentNode.parentNode.insertBefore(tick.check, tick.el.parentNode.nextSibling);
  }

  updateTotalPrice();

  var gpid = priceData
    .map(function (x) {
      return x.gameId;
    })
    .filter(function (x, i, a) {
      return a.indexOf(x) === i;
    });

  var x = new XMLHttpRequest();
  x.open("GET", "https://api.kikicat123.ca/v1/sapi/appdetails?filters=price_overview&cc=CA&appids=" + gpid.join(","));
  x.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      var j = JSON.parse(this.responseText);
      for (var i = 0; i < priceData.length; i++) {
        var tick = priceData[i];
        var k = j[tick.gameId];
        if (k.success && k.data.price_overview.currency == "CAD") {
          tick.price = k.data.price_overview.final;
          tick.el.setAttribute("data-current-price", tick.price);
          tick.el.textContent = formattedPrice(tick.price);
          updateTotalPrice();
        }
      }
    }
  };
  x.send();
}

function updateTotalPrice() {
  totalPriceEl.textContent = formattedPrice(
    priceData
      .filter(function (x) {
        return x.check.checked;
      })
      .map(function (x) {
        return x.price;
      })
      .reduce(function (a, b) {
        return a + b;
      })
  );
}

function formattedPrice(x) {
  x = x.toString();
  return "C$" + x.slice(0, -2) + "." + x.slice(-2);
}

function parseFormattedPrice(x) {
  if (x.slice(0, 2) !== "C$") console.error("Default HTML page has invalid price formatting");
  return parseInt(x.slice(2).split(".").join(""));
}

window.addEventListener("load", function () {
  loadPrices();
});
