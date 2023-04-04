function loadPrices() {
  var gp = document.getElementsByClassName("game-price");
  var gpid = [];
  for (var i = 0; i < gp.length; i++) {
    gpid.push(gp[i].getAttribute("data-game-id"));
    gp[i].setAttribute("data-original-price", gp[i].textContent);
  }
  var x = new XMLHttpRequest();
  x.open("GET", "https://api.kikicat123.ca/v1/sapi/appdetails?filters=price_overview&cc=CA&appids=" + gpid.join(","));
  x.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      var j = JSON.parse(this.responseText);
      for (var i = 0; i < gp.length; i++) {
        var k = j[gp[i].getAttribute("data-game-id")];
        if (k.success && k.data.price_overview.currency == "CAD") {
          gp[i].setAttribute("data-current-price", k.data.price_overview.final);
          gp[i].textContent = "(" + formattedPrice(k.data.price_overview.final) + ")";
        }
      }
    }
  };
  x.send();
}

function formattedPrice(x) {
  x = x.toString();
  return "C$" + x.slice(0, -2) + "." + x.slice(-2);
}

window.addEventListener("load", function () {
  loadPrices();
});
