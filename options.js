function saveOrder(e) {
  var order = [];
  var c, checks = document.getElementsByClassName('order');
  for (var i=0; c=checks[i]; i++) {
    if (c.checked) {
      order.push(c.id);
    }
  }
  localStorage['ORDER'] = JSON.stringify(order);
}

function saveUrl(e) {
  var url = document.getElementById('url-input').value;
    if (url.length > 5) {
    if (url.indexOf('http') !== 0) {
      url = "http://" + url;
    }
    if (url.substr(-1,1) == "/") {
      url = url.substr(0, url.length-1);
    }
    localStorage['URL'] = url;
  }
}


window.onload = function() {
  document.getElementById('url-input').value = localStorage['URL'] || "";
  document.getElementById('url-input').addEventListener('blur', saveUrl);
  document.getElementById('url-form').addEventListener('submit', saveUrl);
  var order = localStorage['ORDER'] ? JSON.parse(localStorage['ORDER']) : ['pushes', 'stars', 'opens'];
  var c, checks = document.getElementsByClassName('order');
  for (var i=0; c=checks[i]; i++) {
    if (order.indexOf(c.id) !== -1) {
      c.checked = true;
    }
    c.addEventListener('click', saveOrder);
  }
};

