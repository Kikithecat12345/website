const totalPriceEl = document.getElementById("game-price-total");
const gp = document.getElementsByClassName("game-price");
const globalCheckbox = document.getElementById("global-checkbox");

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
    tick.el.setAttribute("title", "Original price: " + formattedPrice(tick.price));
    tick.check = document.createElement("input");
    tick.check.setAttribute("type", "checkbox");
    tick.check.setAttribute("checked", "checked");
    tick.check.addEventListener("change", function () {
      var checkedLen = priceData.filter(function (x) {
        return x.check.checked;
      }).length;
      globalCheckbox.checked = checkedLen === priceData.length;
      globalCheckbox.indeterminate = checkedLen > 0 && checkedLen < priceData.length;
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
      }, 0)
  );
}

function formattedPrice(x) {
  var high = Math.floor(x / 100);
  var low = (x % 100);
  return "C$" + high.toString() + "." + (low < 10 ? '0' : '') + low.toString();
}

function parseFormattedPrice(x) {
  if (x.slice(0, 2) !== "C$") console.error("Default HTML page has invalid price formatting");
  return parseInt(x.slice(2).split(".").join(""));
}

function tickAll(checked) {
  for(var i = 0; i < priceData.length; i++) {
    priceData[i].check.checked = checked;
  }
}

window.addEventListener("load", function () {
  loadPrices();

  globalCheckbox.addEventListener("change", function() {
    tickAll(globalCheckbox.checked);
    updateTotalPrice();
  });
});
