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

        /* responsive grid setup */
        /*
        .col { margin-bottom: 1.5rem; }
        .container { margin: 0 auto; max-width: 80rem; width: 90%; }
        */
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

        @media (min-width: 40rem) {
            html {
                font-size: 112%;
            }

            /*  GRID OF FIVE  */
            .span_5_of_5 {
                width: 100%;
            }

            .span_4_of_5 {
                width: 79.68%;
            }

            .span_3_of_5 {
                width: 59.36%;
            }

            .span_2_of_5 {
                width: 39.04%;
            }

            .span_1_of_5 {
                width: 18.72%;
            }

            .col.flow-opposite {
                float: right;
            }
        }

        @media only screen and (max-width: 480px) {
            /*  SMALL SCREEN - USE FULL WIDTH  */
            .col {
                margin: 1% 0 1% 0%;
            }

            .span_1_of_5, .span_2_of_5, .span_3_of_5, .span_4_of_5, .span_5_of_5 {
                width: 100%;
            }
        }

        /* deichman ui styles */
        a, a:visited {
            color: navy;
        }

        .logo {
            margin-right: 3em;
        }

        .small-text {
            font-size: 0.8em;
        }

        .big-text {
            font-size: 1.4em;
        }

        .header {
            background: #eee;
            width: 100%;
            padding: 1em;
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
            <div class="col span_1_of_5">
                <img class="logo" width="164" height="24px" src="/logo.png"/>
            </div>
            <div class="col span_2_of_5">
                <div class="big-text">ls.ext</div>
            </div>
        </div>
    </div>
</div>
<div class="section">
    <div class="row">
        <div class="col full">
            <h2>${DESCRIPTION}</h2>
        </div>
    </div>
    <div class="row">
        <div class="col span_1_of_5">&nbsp;</div>
        <div class="col span_2_of_5">
            <strong>beskrivelse</strong>
        </div>
        <div class="col span_2_of_5">
            <strong>eksempler</strong>
        </div>
    </div>
</div>

<div class="section">
    <h3>Brukertjenester</h3>
    <div class="row">
        <div class="col span_1_of_5">
            <a href="http://${HOST}:${KOHA_OPAC_PORT}">Kohas OPAC</a>
        </div>
        <div class="col span_2_of_5">
            Kohas standard grensesnitt for brukeren. Tilbyr mappami-funksjonalitet og søk/reservering. Vil ikke bli
            brukt i LS.ext.
        </div>
        <div class="col span_2_of_5">

        </div>
    </div>

    <div class="row">
        <div class="col span_1_of_5">
            <a href="http://${HOST}:${PATRON_CLIENT_PORT}/search">PatronClient</a>
        </div>
        <div class="col span_2_of_5">
            LS.ext lånergrensesnitt
        </div>
        <div class="col span_2_of_5">
            Søk på enkeltord i tittel eller personer
        </div>
    </div>

    <h3>Interne tjenester</h3>

    <div class="row">
        <div class="col span_1_of_5">
            <a href="http://${HOST}:${KOHA_INTRA_PORT}">Kohas Intra</a>
        </div>
        <div class="col span_2_of_5">
            Kohas intranett. Katalogisering, brukerhåndtering, utlån/innlevering, osv.
        </div>
        <div class="col span_2_of_5">

        </div>
    </div>

    <div class="row">
        <div class="col span_1_of_5">
            <a href="http://${HOST}:${CATALINKER_PORT}">Catalinker</a>
        </div>
        <div class="col span_2_of_5">
            Katalogiseringsverktøy
        </div>
        <div class="col span_2_of_5">
            <a href="http://${HOST}:${CATALINKER_PORT}/workflow">/person</a>
            <a href="http://${HOST}:${CATALINKER_PORT}/workflow">/publication</a>
            <a href="http://${HOST}:${CATALINKER_PORT}/workflow">/work</a>
            <a href="http://${HOST}:${CATALINKER_PORT}/workflow">/workflow</a>
        </div>
    </div>

    <h3>Tekniske grensesnitt</h3>

    <div class="row">
        <div class="col span_1_of_5">
            <a href="http://${HOST}:${SERVICES_PORT}/application.wadl?detail=true">Services</a>
        </div>
        <div class="col span_2_of_5">
            API for LS.ext som håndterer dataflyt mellom RDF, Koha og presentasjonslag.
        </div>
        <div class="col span_2_of_5">

        </div>
    </div>
    <div class="row">
        <div class="col span_1_of_5">
            <a href="http://${HOST}:${JAMON_PORT}/jamonadmin.jsp">JAMon</a>
        </div>
        <div class="col span_2_of_5">
            Måleverktøy for ytelse og responstider i Services
        </div>
        <div class="col span_2_of_5">

        </div>
    </div>
    <div class="row">
        <div class="col span_1_of_5">
            <a href="http://${HOST}:${TRIPLESTORE_PORT}">Triplestore</a>
        </div>
        <div class="col span_2_of_5">
            RDF-endpoint
        </div>
        <div class="col span_2_of_5">

        </div>
    </div>
    <div class="row">
        <div class="col span_1_of_5">
            <a href="http://${HOST}:${ELASTICSEARCH_PORT}/?pretty">Elasticsearch</a>
        </div>
        <div class="col span_2_of_5">
            Indekseringsmotor
        </div>
        <div class="col span_2_of_5">

        </div>
    </div>

    <h3>Versjonsinformasjon</h3>

    <div class="row">
        <div class="col span_1_of_5">
            GITREF
        </div>
        <div class="col span_2_of_5">
            ${GITREF}
        </div>
    </div>
    <div class="row">
        <div class="col span_1_of_5">
            Jenkins ID
        </div>
        <div class="col span_2_of_5">
            ${BUILD_TAG}
        </div>
    </div>
</div>
<!-- /container -->

</body>

</html>
