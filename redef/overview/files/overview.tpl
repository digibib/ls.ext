<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="koha-version" content="${KOHA_IMAGE_TAG}">
    <meta name="redef-version" content="${GITREF}">
    <style>
        /* normalize.css */
        *, *:before, *:after {
            -moz-box-sizing: border-box;
            -webkit-box-sizing: border-box;
            box-sizing: border-box;
        }

        html {
            font-size: 100%;
            font-family: sans-serif;
            -ms-text-size-adjust: 100%;
            -webkit-text-size-adjust: 100%;
        }

        body {
            margin: 0;
            color: #222;
        }
        ul { list-style-type: none; padding: 0;}
        ul li { margin-bottom: 0.5em; }

        /*  SECTIONS  */
        .section {
            clear: both;
            padding: 0px;
            margin: 0px;
            margin: 0 auto;
            max-width: 80rem;
            width: 90%;
        }

        /*  COLUMN SETUP  */
        .col {
            display: block;
            float: left;
            margin-bottom: 0.3px;
            width: 90%;
        }

        .col:first-child {
            margin-left: 0;
        }

        /*  GROUPING  */
        .row {
            padding-bottom: 8px;
        }

        .row:before,
        .row:after {
            content: "";
            display: table;
        }

        .row:after {
            clear: both;
        }


        /* deichman ui styles */
        a, a:visited { color: #444; }
        a:hover { background-color: #eee; }
        .logo { float: right }

        .panel { width: 33%; border:5px solid #fff; padding: 1em; height: 10em;}
        .bg-grey { background: #eee; }
        .bg-pink { background: #ffaeae; }
        .panel a { display:block; font-size: 120%;
                   text-decoration: none; padding: 0.5em; text-align: center; border: 2px solid #fff;}
        .bg-yellow { background-color: #E6A817; }
        .bg-yellow h3 { color: #fff; }
        .panel a:hover { background-color: #777; }
        .header {
            background: #222;
            width: 100%;
            padding: 1em;
            color: #fff;
        }

        a.more {
            display: block;
            float: right;
            background: #444;
            color: #fff;
            border-radius: 3em;
            padding: 1em;
            text-decoration: none
        }

        a.more:visited {
            color: #fff;
        }
        label { font-weight: bold; display: inline-block; width: 8em; }

    </style>
    <title>Oversikt LS.ext</title>
</head>
<body>
<div class="header">
    <div class="section">
        <div class="row">
            <img class="logo" src="/logo.gif"/>
            <h1>Skranken</h1>
        </div>
    </div>
</div>

<div class="section">
    <div class="row">
        <div class="col panel bg-grey">
            <form id="pinsjekk">
                <p>
                    <label>Lånenummer:</label>
                    <input type="string" id="userid"/>
                </p>
                <p>
                    <label>PIN:</label>
                    <input type="password" id="password"/>
                </p>
                <button type="submit">Sjekk PIN</button>
            </form>
        </div>
        <div class="col panel bg-grey">
            <a class="bg-yellow" href="http://${HOST}:${KOHA_INTRA_PORT}/cgi-bin/koha/circ/circulation-home.pl"><h3>Skranke utlån</h3></a>
        </div>
        <div class="col panel bg-grey">
            <a class="bg-yellow" href="http://${HOST}:${KOHA_INTRA_PORT}/cgi-bin/koha/circ/returns.pl"><h3>Skranke innlevering</h3></a>
        </div>
        <div class="col panel bg-grey">
            <a class="bg-yellow" href="http://${HOST}:${KOHA_INTRA_PORT}/cgi-bin/koha/members/members-home.pl"><h3>Finn bruker</h3></a>
        </div>
        <div class="col panel bg-grey">
            <h3>Prege (TODO)</h3>
        </div>
        <div class="col panel bg-grey">
            <a class="bg-yellow"  href="http://${HOST}:${PATRON_CLIENT_PORT}/"><h3>Websøket</h3></a>
        </div>
    </div>
</div>
<div class="section">
    <div class="row"><h1>Nyttige verktøy</h1></div>
    <div class="row">
        <div class="col panel bg-pink">
            <a class="bg-grey" href="http://blogg.deichman.no/koha/"><h3>Læringsportalen</h3></a>
            <p><strong>Lær!</strong> KUL-epostadresse+passord</p>
        </div>
        <div class="col panel bg-pink">
            <a class="bg-grey" href="https://sites.google.com/site/nyttbib/"><h3>Alt om biblioteksystemet</h3></a>
            <p><strong>Rutiner og informasjon</strong></p>
        </div>
        <div class="col panel bg-pink">
            <a class="bg-grey" href="http://wiki.deichman.no/index.php/Bibliotekfaglige_lenker"><h3>Bibliotekfaglige lenker</h3></a>
        </div>
    </div>
    <div class="row">
        <div class="col panel bg-pink">
            <a class="bg-grey" href="shared/results.html"><h3>Resultat søketester</h3></a>
        </div>
    </div>
    <div class="row"><h1>Nyttige verktøy</h1></div>
    <h2>Versjonsinformasjon</h2>
    <p><strong>GITREF:</strong> ${GITREF}</p>
</div>
<!-- /container -->



<script>
    var form = document.getElementById("pinsjekk");
    form.addEventListener("submit", function(event) {
        event.preventDefault();
        var userid = document.getElementById("userid").value;
        var password = document.getElementById("password").value;
        if (password === "") {
            document.getElementById("password").focus()
            return;
        }
        var request = new XMLHttpRequest();
        request.open('POST', 'http://${HOST}:${KOHA_INTRA_PORT}/api/v1/auth/session', true);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        request.onload = function() {
          if (request.status == 201) {
            // OK!
            form.style.backgroundColor = "#66FF00";
          } else {
            // Not OK
            form.style.backgroundColor = "red";
          }
        };

        request.onerror = function() {
          form.style.backgroundColor = "yellow";
        };

        request.send("userid="+userid+"&password="+password);
    })
</script>
</body></html>