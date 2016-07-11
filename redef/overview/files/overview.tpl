<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
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

        .panel { width: 33%; background: #eee; border:5px solid #fff; padding: 1em; height: 310px;}
        .panel a { display:block; color: #fff; background-color: #E6A817; font-size: 120%;
                   text-decoration: none; padding: 0.5em; text-align: center; border: 2px solid #fff;}
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

    </style>
    <title>Oversikt LS.ext</title>
</head>

<body>
<div class="header">
    <div class="section">
        <div class="row">
            <img class="logo" src="/logo.gif"/>
            <h1>Innlogging til nytt biblioteksystem</h1>
        </div>
    </div>
</div>

<div class="section">
    <div class="row">
        <div class="col panel">
            <a href="http://${HOST}:${PATRON_CLIENT_PORT}/search"><h3>Søket</h3></a>
            <p><strong>Søkegrensesnitt for ansatte og sluttbrukere.</strong></p>
            <p>Her trenger du ikke å logge deg inn, men får bare tilgang fra Deichman.</p>
            <p>Søket er under utvikling og vil forandre seg kontinuerlig frem til september. Test i vei!</p>
        </div>
        <div class="col panel">
            <a href="http://${HOST}:${KOHA_INTRA_PORT}"><h3>Koha</h3></a>
            <p><strong>Ansattes grensesnitt</strong></p>
            <p>Utlån/innlevering, brukerregistrering , endre reservasjoner osv.</p>
            <p>Logg inn med Nasjonalt lånernummer og pinkode.</p>
            <p>Innstillingene endres etter hvordan Deichman ønsker å ha det frem mot september.</p>
        </div>
        <div class="col panel">
            <a href="http://${HOST}:${CATALINKER_PORT}"><h3>Katalogisering</h3></a>
            <p><strong>Katalogiseringsverktøy</strong></p>
            <p>Her trenger du ikke å logge deg inn.</p>
            <p>Grensesnittet er ikke ferdig og vil utvikles frem mot september.</p>
        </div>
    </div>
    <h2>Versjonsinformasjon</h2>
    <p><strong>GITREF:</strong> ${GITREF}</p>
    <p><strong>Jenkins bygg nr.</strong>${BUILD_TAG}</p>

</div>
<!-- /container -->

</body>

</html>
