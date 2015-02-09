# encoding: UTF-8
# language: no

@migration
Egenskap: Test av sirkulasjonsregler
  Som adminbruker
  Ønsker jeg å sjekke at sirkulasjonsreglene er på plass

  Bakgrunn:
    Gitt at jeg er logget inn som adminbruker
    Og at jeg er på sida for sirkulasjonsregler

    Scenario: Test at de ulike sirkulasjonene er på plass
	    Gitt at sirkulasjonsreglene på sida stemmer overens med følgende data
      | Barn                   | All                                         | 20        | 28 | days | None defined | 20.00 | 14 | 7  | 20.00  | 0 |  | 2 | 28 |  | No | 20 |          | Edit |
      | Barnehage              | All                                         | Unlimited | 42 | days | None defined | 0.00  | 14 | 0  |        | 0 |  | 2 | 28 |  | No | 20 |          | Edit |
      | Boken kommer           | All                                         | Unlimited | 60 | days | None defined | 50.00 | 14 | 14 | 100.00 | 0 |  | 3 | 28 |  | No | 20 |          | Edit |
      | Elevlåner              | All                                         | Unlimited | 28 | days | None defined | 0.00  | 14 | 14 |        | 0 |  | 3 | 10 |  | No | 20 |          | Edit |
      | Fjernlån               | All                                         | Unlimited | 42 | days | None defined | 0.00  | 14 | 7  |        | 0 |  | 2 | 28 |  | No | 20 |          | Edit |
      | Fylkes-/folkebibliotek | All                                         | Unlimited | 42 | days | None defined | 0.00  | 14 | 0  |        | 0 |  | 2 | 28 |  | No | 20 |          | Edit |
      | Grunnskole             | All                                         | Unlimited | 60 | days | None defined | 0.00  | 28 | 7  |        | 0 |  | 8 | 30 |  | No | 20 |          | Edit |
      | Institusjon            | All                                         | Unlimited | 42 | days | None defined | 0.00  | 14 | 7  |        | 0 |  | 2 | 28 |  | No | 20 |          | Edit |
      | MXV                    | All                                         | 30        | 28 | days | None defined | 50.00 | 14 | 7  | 100.00 | 0 |  | 2 | 28 |  | No | 20 |          | Edit |
      | Midlertidig bosatt     | All                                         | 2         | 28 | days | None defined | 50.00 | 14 | 7  | 100.00 | 0 |  | 2 | 28 |  | No | 20 |          | Edit |
      | Pasient                | All                                         | 20        | 28 | days | None defined | 0.00  | 14 | 7  |        | 0 |  | 2 | 28 |  | No | 20 |          | Edit |
      | Skole                  | All                                         | Unlimited | 42 | days | None defined | 0.00  | 14 | 7  |        | 0 |  | 2 | 28 |  | No | 20 |          | Edit |
      | Ukjent                 | All                                         | Unlimited | 28 | days | None defined | 50.00 | 14 | 7  | 100.00 | 0 |  | 2 | 28 |  | No | 20 |          | Edit |
      | Utgått elev            | All                                         | Unlimited | 28 | days | None defined | 0.00  | 14 | 14 |        | 0 |  | 2 | 10 |  | No | 20 |          | Edit |
      | Videregående skole     | All                                         | Unlimited | 42 | days | None defined | 0.00  | 14 | 0  |        | 0 |  | 2 | 28 |  | No | 20 |          | Edit |
      | Voksen                 | All                                         | 20        | 28 | days | None defined | 50.00 | 14 | 7  | 100.00 | 0 |  | 2 | 28 |  | No | 20 |          | Edit |
      | All                    | Elektroniske ressurser - Blue-ray-ROM       | Unlimited | 28 | days | None defined | 0.00  | 21 | 0  |        | 0 |  | 3 | 28 |  | No | 20 |          | Edit |
      | All                    | Elektroniske ressurser - CD-ROM             | Unlimited | 28 | days | None defined | 0.00  | 21 | 0  |        | 0 |  | 3 | 28 |  | No | 20 |          | Edit |
      | All                    | Elektroniske ressurser - DVD-ROM            | Unlimited | 28 | days | None defined | 0.00  | 21 | 0  |        | 0 |  | 3 | 28 |  | No | 20 |          | Edit |
      | All                    | Film og video - blu-ray                     | Unlimited | 7  | days | None defined | 0.00  | 21 | 0  |        | 0 |  | 3 | 7  |  | No | 20 |          | Edit |
      | All                    | Film og video - videokassett                | Unlimited | 7  | days | None defined | 0.00  | 21 | 0  |        | 0 |  | 3 | 7  |  | No | 20 |          | Edit |
      | All                    | Film og video - videokassett - for døve     | Unlimited | 28 | days | None defined | 0.00  | 21 | 0  |        | 0 |  | 3 | 28 |  | No | 20 |          | Edit |
      | All                    | Film og video - videokassett - språkkurs    | Unlimited | 28 | days | None defined | 0.00  | 21 | 0  |        | 0 |  | 3 | 28 |  | No | 20 |          | Edit |
      | All                    | Film og video - videoplate DVD              | Unlimited | 7  | days | None defined | 0.00  | 21 | 0  |        | 0 |  | 3 | 7  |  | No | 20 |          | Edit |
      | All                    | Film og video - videoplate DVD - for døve   | Unlimited | 28 | days | None defined | 0.00  | 21 | 0  |        | 0 |  | 3 | 28 |  | No | 20 |          | Edit |
      | All                    | Film- og video - Videoplate DVD - lydbok    | Unlimited | 28 | days | None defined | 0.00  | 21 | 0  |        | 0 |  | 3 | 28 |  | No | 20 |          | Edit |
      | All                    | Film- og video - Videoplate DVD - musikk    | Unlimited | 14 | days | None defined | 0.00  | 21 | 0  |        | 0 |  | 3 | 14 |  | No | 20 |          | Edit |
      | All                    | Film- og video - Videoplate DVD - språkkurs | Unlimited | 28 | days | None defined | 0.00  | 21 | 0  |        | 0 |  | 3 | 28 |  | No | 20 |          | Edit |
      | All                    | Kart                                        | Unlimited | 28 | days | None defined | 0.00  | 21 | 0  |        | 0 |  | 3 | 28 |  | No | 20 |          | Edit |
      | All                    | Lydopptak - kassett - lydbok                | Unlimited | 28 | days | None defined | 0.00  | 21 | 0  |        | 0 |  | 3 | 28 |  | No | 20 |          | Edit |
      | All                    | Lydopptak - kassett - musikk                | Unlimited | 14 | days | None defined | 0.00  | 21 | 0  |        | 0 |  | 3 | 14 |  | No | 20 |          | Edit |
      | All                    | Lydopptak - kassett - språkkurs             | Unlimited | 28 | days | None defined | 0.00  | 21 | 0  |        | 0 |  | 3 | 28 |  | No | 20 |          | Edit |
      | All                    | Lydopptak - kompaktplate - lydbok           | Unlimited | 28 | days | None defined | 0.00  | 21 | 0  |        | 0 |  | 3 | 28 |  | No | 20 |          | Edit |
      | All                    | Lydopptak - kompaktplate - musikk           | Unlimited | 14 | days | None defined | 0.00  | 21 | 0  |        | 0 |  | 3 | 14 |  | No | 20 |          | Edit |
      | All                    | Lydopptak - kompaktplate - språkkurs        | Unlimited | 28 | days | None defined | 0.00  | 21 | 0  |        | 0 |  | 3 | 28 |  | No | 20 |          | Edit |
      | All                    | Musikk-video                                | Unlimited | 14 | days | None defined | 0.00  | 21 | 0  |        | 0 |  | 3 | 14 |  | No | 20 |          | Edit |
      | All                    | Noter                                       | Unlimited | 28 | days | None defined | 0.00  | 21 | 0  |        | 0 |  | 3 | 28 |  | No | 20 |          | Edit |
      | All                    | Periodika                                   | Unlimited | 14 | days | None defined | 0.00  | 21 | 0  |        | 0 |  | 2 | 14 |  | No | 0  |          | Edit |
      | All                    | All                                         | 10        | 10 | days | None defined | 0.00  | 0  | 0  |        | 0 |  | 0 | 0  |  | No | 10 | 0.000000 | Edit |
