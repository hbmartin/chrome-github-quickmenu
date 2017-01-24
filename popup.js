if (localStorage['http_auth'] == undefined) {
  window.location = "setup.html";
}
var GitHubURL = localStorage['URL'],
    username, o, old_heads, html = {
      'pushes' : '<h2>Recent Pushes</h2><ol id="pushes"><h4>Loading...</h4></ol>',
      'stars' : '<h2>Starred Repos</h2><ol id="stars"><h4>Loading...</h4></ol>',
      'opens' : '<h2>Open Pull Requests</h2><ol id="opens"><h4>Loading...</h4></ol>'
    },
	username = localStorage['username'],
    xhr = new XMLHttpRequest(), xhr2 = new XMLHttpRequest(), xhr3 = new XMLHttpRequest();

// hacks for dealing with differences between non/hosted GH
var GitHubAPI = GitHubURL + (GitHubURL.indexOf('github.com') == -1 ? "/api/v3" : '');
if (GitHubURL == 'https://api.github.com') { GitHubURL = 'https://github.com'; }

if (localStorage['old_heads']) {
  old_heads = localStorage['old_heads'].split(',');
} else {
  old_heads = [];
  localStorage['old_heads'] = "";
}

var order = localStorage['ORDER'] ? JSON.parse(localStorage['ORDER']) : ['pushes', 'stars', 'opens'];
for (var i=0; o=order[i]; i++) {
  document.body.innerHTML += html[o];
}
  
if (order.indexOf('pushes') !== -1) {
  xhr.open("GET", GitHubAPI + "/users/" + username + "/events", true);
  xhr.setRequestHeader("Authorization", localStorage['http_auth']);
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      var events = JSON.parse(xhr.responseText), i, e, ignore = {}, count = 0, list = document.getElementById('pushes');
      pushes.innerHTML = "";
      for (i=0;e=events[i];i++) {
        if (e.type=="PushEvent") {
          if (!ignore[(e.repo.name + "/" + e.payload.ref.split("/")[2])] && old_heads.indexOf(e.payload.head) == -1 && 
	  			!(e.payload.commits.length == 2 && e.payload.commits[1].message.indexOf('Merge pull request') == 0) ) {
            var branch = e.payload.ref.split("/")[2], create_date = new Date(e.created_at).toDateString().split(" "), url=e.repo.url.replace('api/v3/repos/','');
            pushes.innerHTML += "<li >" + '<a target="_blank" href="' + GitHubURL + "/" + e.repo.name + '/pull/new/develop...' + branch + '" class="minibutton btn-pull-request" data-head="' + e.payload.head + '">Pull Request</a>' +
                                "<h3><a target ='_blank' href='" + url + "'>" + e.payload.commits[0].message + "</a></h3>" +
                                "<time>" + (create_date[1] + " " + create_date[2] + ", " + create_date[3]) + "</time> " +
                                '<span class="cmeta">' + '<a target ="_blank" href="' + url + '/tree/' + branch + '">' + (e.repo.name +"/"+branch) + '</a></li>';
            count += 1;
          }
        } else if  (e.type=="PullRequestEvent") {
          ignore[(e.repo.name + "/" + e.payload.pull_request.head.ref)] = true;
        }
      }
      if (count == 0) {
        pushes.innerHTML = "<h4>No <a target ='_blank' href='" + GitHubURL + "/" + username + "?tab=activity'>unpulled pushes</a>... been working hard?</h4>";
      }

      var PR_btns = document.getElementsByClassName('btn-pull-request'), b, xhr_b = new XMLHttpRequest();
      for (i=0; b=PR_btns[i]; i++) {
        xhr_b.open("GET", b.getAttribute('href'), false);
        xhr_b.onreadystatechange = function() {
          if (xhr_b.readyState == 4) {
            if(xhr_b.responseText.indexOf("is already up-to-date with") !== -1) {
              localStorage['old_heads'] += "," + b.getAttribute('data-head');
              b.parentNode.hidden=true;
            }
          }
        };
        xhr_b.send();
      }
    }
  };
  xhr.send();
}
if (order.indexOf('stars') !== -1) {
  xhr2.open("GET", GitHubAPI + "/users/" + username + "/starred", true);
  xhr2.setRequestHeader("Authorization", localStorage['http_auth']);
  xhr2.onreadystatechange = function() {
    if (xhr2.readyState == 4) {
      var repos = JSON.parse(xhr2.responseText), i, r = repos.length, el = document.getElementById('stars'), el_i = '';
      if (r == 0) {
        el.innerHTML = "<h4><a target ='_blank' href='" + GitHubURL + "/stars'>Y u no make stars?</a></h4>"
      } else {
        for (i=0;i<r;i++) {
          el_i += '<li class="public source"><h3><a target ="_blank" href="' + repos[i].html_url + '" ><span class="repo">' + repos[i].name + '</span></a></h3></li>';
        }
        el.innerHTML = el_i;
      }
    }
  };
  xhr2.send();
}
if (order.indexOf('opens') !== -1) {
  xhr3.open("GET", GitHubURL + "/" + username + "?tab=contributions&period=monthly", true);
  xhr3.onreadystatechange = function() {
    if (xhr3.readyState == 4) {
      var el_i = document.createElement('div'), count=0;
      el_i.innerHTML = xhr3.responseText;
      pulls = el_i.getElementsByClassName('contribution-pulls-list')[0].getElementsByTagName('li');
      el =  document.getElementById('opens');
      el.innerHTML = "";
      for (var i=0; p=pulls[i]; i++) {
        if (p.getElementsByClassName('state')[0].innerText == "Open") {
          count += 1;
          var el_li = document.createElement('li');
          var regex = new RegExp('<a', 'gi');
          el_li.innerHTML = p.innerHTML.replace(regex, '<a target="_blank" ');
          el.appendChild(el_li);
        }
      }
      if (count == 0) {
        el.innerHTML = "<h4>No open <a target ='_blank' href='" + GitHubURL + "/" + username + "?tab=contributions&period=monthly'>pull requests</a></h4>";
      }
    }
  };
  xhr3.send();
}

