window.onload = function() {
  if (localStorage['username']) {
	  document.getElementById('username').value = localStorage['username'];
  }
  document.getElementById('setup-form').addEventListener('submit', function(e) {
		e.preventDefault();
    if (document.getElementById('username').value == "") {
      document.getElementById('username').className += " alert";
      return;
    } else {
      localStorage['username'] = document.getElementById('username').value.replace(".","-");
    }
    var pass = document.getElementById('password').value;
    if (pass == "") {
      document.getElementById('password').className += " alert";
      return;
    } else {
      localStorage['http_auth']= "Basic " + btoa(localStorage['username'].replace("-",".") + ":" + pass);
    }
    var url = document.getElementById('url-input').value;
    if (url.length < 5) {
      document.getElementById('url-input').className += " alert";
      return;
    } else {
      if (url.indexOf('http') !== 0) {
        url = "http://" + url;
      }
      if (url.substr(-1,1) == "/") {
        url = url.substr(0, url.length-1);
      }
      localStorage['URL'] = url;
    }
    document.getElementById('content').innerHTML = "<h2>Checking username/password...</h2>";
    var GitHubAPI = url + (url.indexOf('github.com') == -1 ? "/api/v3" : '');
	var xhr = new XMLHttpRequest();
    xhr.open("GET", GitHubAPI + "/users/" + localStorage['username'] + "/events");
    xhr.setRequestHeader("Authorization", localStorage['http_auth']);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if (xhr.status == 200) {
          document.getElementById('content').innerHTML = "<h2>Looks good! Rerouting...</h2>";
          window.location = "popup.html";
        } else {
          localStorage.removeItem('http_auth');
          document.getElementById('content').innerHTML = "<h2>Sorry, there was a problem</h2><a href='setup.html'>Try again</a>";
        }
      }
    };
	xhr.send();
  });
}