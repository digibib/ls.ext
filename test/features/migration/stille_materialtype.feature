# encoding: UTF-8
# language: no

@migration
Egenskap: Test av materialtyper
  Som adminbruker
  Ønsker jeg å stille materialtyper på ting

  Bakgrunn:
    Gitt at jeg er logget inn som adminbruker

    Scenario: Test at de ulike materialtypene er tilgjengelige
      Gitt at jeg er på side for materialtypeadministrasjon i administrasjonsgrensesnittet
      Så ser jeg at følgende materialtyper er tilgjengelig
      | Image | Code     | Description                                           | Not for loan | Charge | Checkin message | Actions     |
      |       | K        | Artikler (i periodika eller bøker)                    |              | 0.00   |                 | Edit Delete |
      |       | AB       | Atlas                                                 |              | 0.00   |                 | Edit Delete |
      |       | L        | Bok                                                   |              | 0.00   |                 | Edit Delete |
      |       | MN       | Dataspill - Nintendo DS                               |              | 0.00   |                 | Edit Delete |
      |       | MO       | Dataspill - Nintendo Wii                              |              | 0.00   |                 | Edit Delete |
      |       | MA       | Dataspill - PC                                        |              | 0.00   |                 | Edit Delete |
      |       | GD,MA    | Dataspill - PC - CD-ROM                               |              | 0.00   |                 | Edit Delete |
      |       | GC,MA    | Dataspill - PC - DVD-ROM                              |              | 0.00   |                 | Edit Delete |
      |       | MB       | Dataspill - Playstation 2                             |              | 0.00   |                 | Edit Delete |
      |       | MC       | Dataspill - Playstation 3                             |              | 0.00   |                 | Edit Delete |
      |       | GG,MC    | Dataspill - Playstation 3 - Blu-ray-ROM               |              | 0.00   |                 | Edit Delete |
      |       | MD       | Dataspill - Playstation portable                      |              | 0.00   |                 | Edit Delete |
      |       | GH,MD    | Dataspill - Playstation Portable - UMD                |              | 0.00   |                 | Edit Delete |
      |       | GC,MB    | Dataspill - Playstation2 - DVD-ROM                    |              | 0.00   |                 | Edit Delete |
      |       | GI,MO    | Dataspill - Wii-plate                                 |              | 0.00   |                 | Edit Delete |
      |       | MI       | Dataspill - Xbox                                      |              | 0.00   |                 | Edit Delete |
      |       | GC,MI    | Dataspill - Xbox - DVD-ROM                            |              | 0.00   |                 | Edit Delete |
      |       | MJ       | Dataspill - Xbox 360                                  |              | 0.00   |                 | Edit Delete |
      |       | GC,MJ    | Dataspill - Xbox 360 - DVD-ROM                        |              | 0.00   |                 | Edit Delete |
      |       | O        | DRM                                                   |              | 0.00   |                 | Edit Delete |
      |       | LA       | E-bok                                                 |              | 0.00   |                 | Edit Delete |
      |       | G        | Elektroniske ressurser                                |              | 0.00   |                 | Edit Delete |
      |       | GG       | Elektroniske ressurser - Blue-ray-ROM                 |              | 0.00   |                 | Edit Delete |
      |       | GD       | Elektroniske ressurser - CD-ROM                       |              | 0.00   |                 | Edit Delete |
      |       | GB       | Elektroniske ressurser - diskett                      |              | 0.00   |                 | Edit Delete |
      |       | GT       | Elektroniske ressurser - DTBok                        |              | 0.00   |                 | Edit Delete |
      |       | GC       | Elektroniske ressurser - DVD-ROM                      |              | 0.00   |                 | Edit Delete |
      |       | GF       | Elektroniske ressurser - Lagringsbrikke               |              | 0.00   |                 | Edit Delete |
      |       | GF,MN    | Elektroniske ressurser - Lagringsbrikke - Nintendo DS |              | 0.00   |                 | Edit Delete |
      |       | GE       | Elektroniske ressurser - Nettressurs                  |              | 0.00   |                 | Edit Delete |
      |       | GH       | Elektroniske ressurser - UMD                          |              | 0.00   |                 | Edit Delete |
      |       | NB       | EPUB                                                  |              | 0.00   |                 | Edit Delete |
      |       | EG       | Film og video - 3D blu-ray                            |              | 0.00   |                 | Edit Delete |
      |       | EF       | Film og video - blu-ray                               |              | 0.00   |                 | Edit Delete |
      |       | EA       | Film og video - filmkassett                           |              | 0.00   |                 | Edit Delete |
      |       | EB       | Film og video - filmsløyfe                            |              | 0.00   |                 | Edit Delete |
      |       | EC       | Film og video - filmspole                             |              | 0.00   |                 | Edit Delete |
      |       | ED       | Film og video - videokassett                          |              | 0.00   |                 | Edit Delete |
      |       | ED,TF    | Film og video - videokassett - for døve               |              | 0.00   |                 | Edit Delete |
      |       | ED,DH    | Film og video - videokassett - språkkurs              |              | 0.00   |                 | Edit Delete |
      |       | EE       | Film og video - videoplate DVD                        |              | 0.00   |                 | Edit Delete |
      |       | EE,TF    | Film og video - videoplate DVD - for døve             |              | 0.00   |                 | Edit Delete |
      |       | EE,DI    | Film- og video - Videoplate DVD - lydbok              |              | 0.00   |                 | Edit Delete |
      |       | EE,DG    | Film- og video - Videoplate DVD - musikk              |              | 0.00   |                 | Edit Delete |
      |       | EE,DH    | Film- og video - Videoplate DVD - språkkurs           |              | 0.00   |                 | Edit Delete |
      |       | FA       | Grafisk materiale - bilde                             |              | 0.00   |                 | Edit Delete |
      |       | FB       | Grafisk materiale - bildebånd                         |              | 0.00   |                 | Edit Delete |
      |       | FC       | Grafisk materiale - bildekort                         |              | 0.00   |                 | Edit Delete |
      |       | FD       | Grafisk materiale - dias                              |              | 0.00   |                 | Edit Delete |
      |       | FE       | Grafisk materiale - flippover-blokk                   |              | 0.00   |                 | Edit Delete |
      |       | FF       | Grafisk materiale - fotografi                         |              | 0.00   |                 | Edit Delete |
      |       | FG       | Grafisk materiale - grafisk blad                      |              | 0.00   |                 | Edit Delete |
      |       | FH       | Grafisk materiale - hologram                          |              | 0.00   |                 | Edit Delete |
      |       | FI       | Grafisk materiale - kunstreproduksjon                 |              | 0.00   |                 | Edit Delete |
      |       | FJ       | Grafisk materiale - ordkort                           |              | 0.00   |                 | Edit Delete |
      |       | FK       | Grafisk materiale - originalt kunstverk               |              | 0.00   |                 | Edit Delete |
      |       | FL       | Grafisk materiale - plakat                            |              | 0.00   |                 | Edit Delete |
      |       | FM       | Grafisk materiale - plansje                           |              | 0.00   |                 | Edit Delete |
      |       | FN       | Grafisk materiale - postkort                          |              | 0.00   |                 | Edit Delete |
      |       | FO       | Grafisk materiale - røntgenbilde                      |              | 0.00   |                 | Edit Delete |
      |       | FP       | Grafisk materiale - stereobilde                       |              | 0.00   |                 | Edit Delete |
      |       | FQ       | Grafisk materiale - studieplansje                     |              | 0.00   |                 | Edit Delete |
      |       | FR       | Grafisk materiale - symbolkort                        |              | 0.00   |                 | Edit Delete |
      |       | FS       | Grafisk materiale - teknisk tegning                   |              | 0.00   |                 | Edit Delete |
      |       | FT       | Grafisk materiale - transparent                       |              | 0.00   |                 | Edit Delete |
      |       | A        | Kart                                                  |              | 0.00   |                 | Edit Delete |
      |       | DK       | Kombidokument                                         |              | 0.00   |                 | Edit Delete |
      |       | DJ       | Lydopptak - annen tale, annet                         |              | 0.00   |                 | Edit Delete |
      |       | DD       | Lydopptak - digibok                                   |              | 0.00   |                 | Edit Delete |
      |       | DD,DI    | Lydopptak - digibok - lydbok                          |              | 0.00   |                 | Edit Delete |
      |       | DE,DI    | Lydopptak - digikort - lydbok                         |              | 0.00   |                 | Edit Delete |
      |       | DA       | Lydopptak - grammofonplate                            |              | 0.00   |                 | Edit Delete |
      |       | DA,DJ    | Lydopptak - grammofonplate - annet                    |              | 0.00   |                 | Edit Delete |
      |       | DA,DI    | Lydopptak - grammofonplate - lydbok                   |              | 0.00   |                 | Edit Delete |
      |       | DA,DG    | Lydopptak - grammofonplate - musikk                   |              | 0.00   |                 | Edit Delete |
      |       | DA,DH    | Lydopptak - grammofonplate - språkkurs                |              | 0.00   |                 | Edit Delete |
      |       | DB       | Lydopptak - kassett                                   |              | 0.00   |                 | Edit Delete |
      |       | DB,DJ    | Lydopptak - kassett - annet                           |              | 0.00   |                 | Edit Delete |
      |       | DB,DI    | Lydopptak - kassett - lydbok                          |              | 0.00   |                 | Edit Delete |
      |       | DB,DG    | Lydopptak - kassett - musikk                          |              | 0.00   |                 | Edit Delete |
      |       | DB,DH    | Lydopptak - kassett - språkkurs                       |              | 0.00   |                 | Edit Delete |
      |       | DC       | Lydopptak - kompaktplate                              |              | 0.00   |                 | Edit Delete |
      |       | DC,DJ    | Lydopptak - kompaktplate - annet                      |              | 0.00   |                 | Edit Delete |
      |       | DC,DI    | Lydopptak - kompaktplate - lydbok                     |              | 0.00   |                 | Edit Delete |
      |       | DC,DG    | Lydopptak - kompaktplate - musikk                     |              | 0.00   |                 | Edit Delete |
      |       | DC,DH    | Lydopptak - kompaktplate - språkkurs                  |              | 0.00   |                 | Edit Delete |
      |       | DC,DI,DZ | Lydopptak - kompaktplate MP3 - lydbok                 |              | 0.00   |                 | Edit Delete |
      |       | DI       | Lydopptak - lydbok                                    |              | 0.00   |                 | Edit Delete |
      |       | DZ       | Lydopptak - mp3                                       |              | 0.00   |                 | Edit Delete |
      |       | DG       | Lydopptak - musikk                                    |              | 0.00   |                 | Edit Delete |
      |       | DH       | Lydopptak - språkkurs                                 |              | 0.00   |                 | Edit Delete |
      |       | B        | Manuskripter                                          |              | 0.00   |                 | Edit Delete |
      |       | ID       | Mikroformer - mikro-opak                              |              | 0.00   |                 | Edit Delete |
      |       | IA       | Mikroformer - mikrofilmkassett                        |              | 0.00   |                 | Edit Delete |
      |       | IC       | Mikroformer - mikrofilmkort                           |              | 0.00   |                 | Edit Delete |
      |       | IB       | Mikroformer - mikrofilmspole                          |              | 0.00   |                 | Edit Delete |
      |       | IE       | Mikroformer - vinduskassettt                          |              | 0.00   |                 | Edit Delete |
      |       | ED,DG    | Musikk-video                                          |              | 0.00   |                 | Edit Delete |
      |       | GA,NA    | Nedlastbar e-bok, PDF                                 |              | 0.00   |                 | Edit Delete |
      |       | GA       | Nedlastbar fil                                        |              | 0.00   |                 | Edit Delete |
      |       | GA,DZ,DG | Nedlastbar musikk, MP3                                |              | 0.00   |                 | Edit Delete |
      |       | C        | Noter                                                 |              | 0.00   |                 | Edit Delete |
      |       | NA       | PDF                                                   |              | 0.00   |                 | Edit Delete |
      |       | J        | Periodika                                             |              | 0.00   |                 | Edit Delete |
      |       | H        | Tredimensjonal gjenstander                            |              | 0.00   |                 | Edit Delete |
      |       | SM       | Utkånstidskrift                                       |              | 0.00   |                 | Edit Delete |
      |       | VO       | Vertikalordner                                        |              | 0.00   |                 | Edit Delete |
      |       | NL       | WMA                                                   |              | 0.00   |                 | Edit Delete |
      |       | NS       | WMV                                                   |              | 0.00   |                 | Edit Delete |

    Abstrakt Scenario: Stille materialtype
      Gitt at tingen finnes i biblioteket
      Når jeg leter opp en ting i katalogiseringssøk
      Så kan jeg velge å endre materialtypen til "<Type>"
      Eksempler:
      | Type                                                  |
      | Artikler (i periodika eller bøker)                    |
      | Atlas                                                 |
      | Bok                                                   |
      | Dataspill - Nintendo DS                               |
      | Dataspill - Nintendo Wii                              |
      | Dataspill - PC                                        |
      | Dataspill - PC - CD-ROM                               |
      | Dataspill - PC - DVD-ROM                              |
      | Dataspill - Playstation 2                             |
      | Dataspill - Playstation 3                             |
      | Dataspill - Playstation 3 - Blu-ray-ROM               |
      | Dataspill - Playstation portable                      |
      | Dataspill - Playstation Portable - UMD                |
      | Dataspill - Playstation2 - DVD-ROM                    |
      | Dataspill - Wii-plate                                 |
      | Dataspill - Xbox                                      |
      | Dataspill - Xbox - DVD-ROM                            |
      | Dataspill - Xbox 360                                  |
      | Dataspill - Xbox 360 - DVD-ROM                        |
      | DRM                                                   |
      | E-bok                                                 |
      | Elektroniske ressurser                                |
      | Elektroniske ressurser - Blue-ray-ROM                 |
      | Elektroniske ressurser - CD-ROM                       |
      | Elektroniske ressurser - diskett                      |
      | Elektroniske ressurser - DTBok                        |
      | Elektroniske ressurser - DVD-ROM                      |
      | Elektroniske ressurser - Lagringsbrikke               |
      | Elektroniske ressurser - Lagringsbrikke - Nintendo DS |
      | Elektroniske ressurser - Nettressurs                  |
      | Elektroniske ressurser - UMD                          |
      | EPUB                                                  |
      | Film og video - 3D blu-ray                            |
      | Film og video - blu-ray                               |
      | Film og video - filmkassett                           |
      | Film og video - filmsløyfe                            |
      | Film og video - filmspole                             |
      | Film og video - videokassett                          |
      | Film og video - videokassett - for døve               |
      | Film og video - videokassett - språkkurs              |
      | Film og video - videoplate DVD                        |
      | Film og video - videoplate DVD - for døve             |
      | Film- og video - Videoplate DVD - lydbok              |
      | Film- og video - Videoplate DVD - musikk              |
      | Film- og video - Videoplate DVD - språkkurs           |
      | Grafisk materiale - bilde                             |
      | Grafisk materiale - bildebånd                         |
      | Grafisk materiale - bildekort                         |
      | Grafisk materiale - dias                              |
      | Grafisk materiale - flippover-blokk                   |
      | Grafisk materiale - fotografi                         |
      | Grafisk materiale - grafisk blad                      |
      | Grafisk materiale - hologram                          |
      | Grafisk materiale - kunstreproduksjon                 |
      | Grafisk materiale - ordkort                           |
      | Grafisk materiale - originalt kunstverk               |
      | Grafisk materiale - plakat                            |
      | Grafisk materiale - plansje                           |
      | Grafisk materiale - postkort                          |
      | Grafisk materiale - røntgenbilde                      |
      | Grafisk materiale - stereobilde                       |
      | Grafisk materiale - studieplansje                     |
      | Grafisk materiale - symbolkort                        |
      | Grafisk materiale - teknisk tegning                   |
      | Grafisk materiale - transparent                       |
      | Kart                                                  |
      | Kombidokument                                         |
      | Lydopptak - annen tale, annet                         |
      | Lydopptak - digibok                                   |
      | Lydopptak - digibok - lydbok                          |
      | Lydopptak - digikort - lydbok                         |
      | Lydopptak - grammofonplate                            |
      | Lydopptak - grammofonplate - annet                    |
      | Lydopptak - grammofonplate - lydbok                   |
      | Lydopptak - grammofonplate - musikk                   |
      | Lydopptak - grammofonplate - språkkurs                |
      | Lydopptak - kassett                                   |
      | Lydopptak - kassett - annet                           |
      | Lydopptak - kassett - lydbok                          |
      | Lydopptak - kassett - musikk                          |
      | Lydopptak - kassett - språkkurs                       |
      | Lydopptak - kompaktplate                              |
      | Lydopptak - kompaktplate - annet                      |
      | Lydopptak - kompaktplate - lydbok                     |
      | Lydopptak - kompaktplate - musikk                     |
      | Lydopptak - kompaktplate - språkkurs                  |
      | Lydopptak - kompaktplate MP3 - lydbok                 |
      | Lydopptak - lydbok                                    |
      | Lydopptak - mp3                                       |
      | Lydopptak - musikk                                    |
      | Lydopptak - språkkurs                                 |
      | Manuskripter                                          |
      | Mikroformer - mikro-opak                              |
      | Mikroformer - mikrofilmkassett                        |
      | Mikroformer - mikrofilmkort                           |
      | Mikroformer - mikrofilmspole                          |
      | Mikroformer - vinduskassettt                          |
      | Musikk-video                                          |
      | Nedlastbar e-bok, PDF                                 |
      | Nedlastbar fil                                        |
      | Nedlastbar musikk, MP3                                |
      | Noter                                                 |
      | PDF                                                   |
      | Periodika                                             |
      | Tredimensjonal gjenstander                            |
      | Utkånstidskrift                                       |
      | Vertikalordner                                        |
      | WMA                                                   |
      | WMV                                                   |