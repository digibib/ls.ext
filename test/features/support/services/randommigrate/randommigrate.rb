require 'securerandom'
require 'rest-client'
require 'json'
require 'pry'

module RandomMigrate
  class Entity
    def initialize(type, services)
      @services = 'http://services:8005'
      @host = "http://#{ENV['HOST']}:8005"
      @type = type.downcase
      @literals = Hash.new
      @authorized_values = Hash.new
      @raw = []
    end

    def add_literal(predicate, value)
      @literals[predicate] = value
    end

    def add_authorized(predicate, value)
      @authorized_values[predicate] = value
    end

    def add_raw(raw)
      @raw << raw
    end

    def to_ntriples()
      ntriples = "<#{@type}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://data.deichman.no/ontology##{@type.capitalize}> .\n"
      @literals.each do |predicate, value|
        ntriples << "<#{@type}> <http://data.deichman.no/ontology##{predicate}> \"#{value}\" .\n"
      end
      @authorized_values.each do |predicate, value|
        ntriples << "<#{@type}> <http://data.deichman.no/ontology##{predicate}> <#{value}> .\n"
      end
      @raw.each do |raw|
        ntriples << "#{raw}\n"
      end
      ntriples
    end
  end

  class Migrator
    def initialize(host)
      @id = generate_random_string
      @host = host
      @services = 'http://services:8005'
      @formats = %w(DVD Blu-ray Videotape CD-ROM DigiBook NintendoDSGame BoardGame)
      @languages = %w(http://lexvo.org/id/iso639-3/eng http://lexvo.org/id/iso639-3/dan http://lexvo.org/id/iso639-3/nob http://lexvo.org/id/iso639-3/fin http://lexvo.org/id/iso639-3/jpn http://lexvo.org/id/iso639-3/swe)
      @audiences = %w(juvenile ages11To12 ages13To15 ages13To15)
      @publication_uris = []
    end

    def generate_random_string()
      SecureRandom.hex(8)
    end

    def generate_person()
      person_name = generate_random_string
      ntriples = "<http://data.deichman.no/person/h1> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://data.deichman.no/ontology#Person> .
                  <http://data.deichman.no/person/h1> <http://data.deichman.no/ontology#name> \"#{person_name}\" ."
      return person_name, ntriples
    end

    def generate_work(person_uri, prefix = '')
      work_title = generate_random_string
      work_part_title = generate_random_string
      ntriples = "<http://data.deichman.no/work/w1> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://data.deichman.no/ontology#Work> .
                  <http://data.deichman.no/work/w1> <http://data.deichman.no/ontology#mainTitle> \"#{prefix} #{work_title}\" .
                  <http://data.deichman.no/work/w1> <http://data.deichman.no/ontology#partTitle> \"#{prefix} #{work_part_title}\" .
                  <http://data.deichman.no/work/w1> <http://data.deichman.no/ontology#audience> <http://data.deichman.no/audience##{@audiences.sample}> .
                  <http://data.deichman.no/work/w1> <http://data.deichman.no/ontology#contributor> _:c1 .
                  _:c1 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://data.deichman.no/ontology#Contribution> .
                  _:c1 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://data.deichman.no/ontology#MainEntry> .
                  _:c1 <http://data.deichman.no/ontology#agent> <#{person_uri}> .
                  _:c1 <http://data.deichman.no/ontology#role> <http://data.deichman.no/role#author> ."
      return work_title, ntriples
    end

    def generate_publication(work_uri, language = nil, prefix = nil, part_creator_uri = nil)
      publication_title = generate_random_string
      ntriples = "<http://data.deichman.no/publication/p1> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://data.deichman.no/ontology#Publication> .
                  <http://data.deichman.no/publication/p1> <http://data.deichman.no/ontology#publicationOf> <#{work_uri}> .
                  <http://data.deichman.no/publication/p1> <http://data.deichman.no/ontology#mainTitle> \"#{prefix} #{publication_title}\" .
                  <http://data.deichman.no/publication/p1> <http://data.deichman.no/ontology#format> <http://data.deichman.no/format##{@formats.sample}> .
                  <http://data.deichman.no/publication/p1> <http://data.deichman.no/ontology#language> <#{language || @languages.sample}> .
                  <http://data.deichman.no/publication/p1> <http://data.deichman.no/ontology#hasPublicationPart> _:b0 .
                  _:b0 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://data.deichman.no/ontology#PublicationPart> .
                  _:b0 <http://data.deichman.no/ontology#agent> <#{part_creator_uri}> .
                  _:b0 <http://data.deichman.no/ontology#role> <http://data.deichman.no/role#author> .
                  _:b0 <http://data.deichman.no/ontology#mainTitle> \"Påfuglsommer\" .
                  _:b0 <http://data.deichman.no/ontology#startsAtPage> \"1\"^^<http://www.w3.org/2001/XMLSchema#positiveInteger> .
                  _:b0 <http://data.deichman.no/ontology#endsAtPage> \"100\"^^<http://www.w3.org/2001/XMLSchema#positiveInteger> .
                  <http://data.deichman.no/publication/p1> <http://data.deichman.no/ontology#hasPublicationPart> _:b1 .
                  _:b1 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://data.deichman.no/ontology#PublicationPart> .
                  _:b1 <http://data.deichman.no/ontology#agent> <#{part_creator_uri}> .
                  _:b1 <http://data.deichman.no/ontology#role> <http://data.deichman.no/role#author> .
                  _:b1 <http://data.deichman.no/ontology#mainTitle> \"På to hjul i svingen\" .
                  _:b1 <http://data.deichman.no/ontology#startsAtPage> \"101\"^^<http://www.w3.org/2001/XMLSchema#positiveInteger> .
                  _:b1 <http://data.deichman.no/ontology#endsAtPage> \"200\"^^<http://www.w3.org/2001/XMLSchema#positiveInteger> .
                "
      return publication_title, ntriples
    end

    def post_ntriples(type, ntriples)
      response = RestClient.post "#{@services}/#{type}", ntriples, :content_type => 'application/n-triples'
      response.headers[:location]
    end

    def index(type, uri)
      id = uri[uri.rindex('/')+1..-1]
      RestClient.put "#{@services}/#{type}/#{id}/index", {}
    end

    def generate_quick_test_set(branchcode)
      # For Patron Client
      puts 'Migrating quick test set'

      # For search on prefix0#{@id}, get 2 pages with 10 and 6 results
      # For search on prefix1#{@id}, get 2 page with 1 result
      # Generated publications shall trigger filters for language and format
      random_migrate(16, 1, 2, "prefix0#{@id}")
      random_migrate(1, 1, 2, "prefix1#{@id}")

      # For search on prefix1#{@id}, get 1 page with 1 result
      # For search on pubprefix0#{@id}, display Norwegian title on work
      # For search on pubprefix1#{@id}, display English title on work
      # Work page has eleven publications
      # The Swedish publication has three items, one available and two unavailable
      # The available item has the same placement as one of the unavailable items
      # The Danish publication has one unavailable item
      # There should be two media types, book and music recording, also one publication without a media type
      # The books have a language combination to test the special language sorting rules (Norwegian, English, Danish, Swedish, the rest in alphabetical order)
      specialized_migrate(branchcode)
      puts "Random migrate id: #{@id}"
      @id
    end

    def random_migrate(number_of_persons, number_of_works_per_person, number_of_publications_per_work, prefix)
      number_of_persons.times do
        person_uri = post_ntriples 'person', generate_person[1]
        number_of_works_per_person.times do
          work_uri = post_ntriples('work', generate_work(person_uri, prefix)[1])
          number_of_publications_per_work.times do
            @publication_uris << post_ntriples('publication', generate_publication(work_uri, nil, prefix, person_uri)[1])
          end
          index('work', work_uri)
        end
      end
      @id
    end

    def add_item(record_id, available, placement, branchcode, copynumber)
      barcode = SecureRandom.hex(8)
      onloan = available ? "NULL" : "'2011-06-20'"
      cmd ="INSERT INTO items (biblionumber, biblioitemnumber, barcode, homebranch, holdingbranch,itype,itemcallnumber,onloan,copynumber) \
            VALUES(#{record_id},#{record_id},'#{barcode}','#{branchcode}','#{branchcode}','B','#{placement}',#{onloan},'#{copynumber}')"
      `mysql -h koha_mysql -u#{ENV['KOHA_ADMINUSER']} -p#{ENV['KOHA_ADMINPASS']} koha_name -e "#{cmd}"`
    end

    def specialized_migrate(branchcode)
      person_uri = post_ntriples 'person', generate_person[1]
      work_uri = post_ntriples('work', generate_work(person_uri)[1])

      publication_1 = Entity.new('http://data.deichman.no/publication/p1', @services)
      publication_1.add_authorized('publicationOf', work_uri)
      publication_1.add_literal('mainTitle', "pubprefix0#{@id} #{@id}nob")
      publication_1.add_literal('publicationYear', '1900')
      publication_1.add_authorized('language', 'http://lexvo.org/id/iso639-3/nob')
      publication_1.add_authorized('format', 'http://data.deichman.no/format#DVD')
      publication_1.add_authorized('hasMediaType', 'http://data.deichman.no/mediaType#Book')
      @publication_uris << post_ntriples('publication', publication_1.to_ntriples)

      publication_2 = Entity.new('http://data.deichman.no/publication/p2', @services)
      publication_2.add_authorized('publicationOf', work_uri)
      publication_2.add_literal('mainTitle', "pubprefix0#{@id} #{@id}eng")
      publication_2.add_literal('publicationYear', '1900')
      publication_2.add_authorized('language', 'http://lexvo.org/id/iso639-3/eng')
      publication_2.add_authorized('format', 'http://data.deichman.no/format#DVD')
      publication_2.add_authorized('hasMediaType', 'http://data.deichman.no/mediaType#Book')
      @publication_uris << post_ntriples('publication', publication_2.to_ntriples)

      publication_3 = Entity.new('http://data.deichman.no/publication/p3', @services)
      publication_3.add_authorized('publicationOf', work_uri)
      publication_3.add_literal('mainTitle', "pubprefix1#{@id} #{@id}eng")
      publication_3.add_literal('publicationYear', '2000')
      publication_3.add_authorized('language', 'http://lexvo.org/id/iso639-3/eng')
      publication_3.add_authorized('format', 'http://data.deichman.no/format#DVD')
      publication_3.add_authorized('hasMediaType', 'http://data.deichman.no/mediaType#Book')
      @publication_uris << post_ntriples('publication', publication_3.to_ntriples)

      publication_4 = Entity.new('http://data.deichman.no/publication/p4', @services)
      publication_4.add_authorized('publicationOf', work_uri)
      publication_4.add_literal('mainTitle', "pubprefix1#{@id} #{@id}dan")
      publication_4.add_literal('publicationYear', '1900')
      publication_4.add_authorized('language', 'http://lexvo.org/id/iso639-3/dan')
      publication_4.add_authorized('format', 'http://data.deichman.no/format#DVD')
      publication_4.add_authorized('hasMediaType', 'http://data.deichman.no/mediaType#Book')
      @publication_uris << post_ntriples('publication', publication_4.to_ntriples)
      publication_4_uri = @publication_uris.last

      publication_5 = Entity.new('http://data.deichman.no/publication/p5', @services)
      publication_5.add_authorized('publicationOf', work_uri)
      publication_5.add_literal('mainTitle', "pubprefix0#{@id} #{@id}cze")
      publication_5.add_literal('publicationYear', '1900')
      publication_5.add_authorized('language', 'http://lexvo.org/id/iso639-3/cze')
      publication_5.add_authorized('format', 'http://data.deichman.no/format#MP3-CD')
      publication_5.add_authorized('hasMediaType', 'http://data.deichman.no/mediaType#Book')
      @publication_uris << post_ntriples('publication', publication_5.to_ntriples)

      publication_6 = Entity.new('http://data.deichman.no/publication/p6', @services)
      publication_6.add_authorized('publicationOf', work_uri)
      publication_6.add_literal('mainTitle', "pubprefix1#{@id} #{@id}cze")
      publication_6.add_literal('publicationYear', '1900')
      publication_6.add_authorized('language', 'http://lexvo.org/id/iso639-3/cze')
      publication_6.add_authorized('format', 'http://data.deichman.no/format#DVD')
      publication_6.add_authorized('hasMediaType', 'http://data.deichman.no/mediaType#Book')
      @publication_uris << post_ntriples('publication', publication_6.to_ntriples)

      publication_7 = Entity.new('http://data.deichman.no/publication/p7', @services)
      publication_7.add_authorized('publicationOf', work_uri)
      publication_7.add_literal('mainTitle', "pubprefix2#{@id} #{@id}cze")
      publication_7.add_literal('publicationYear', '2000')
      publication_7.add_authorized('language', 'http://lexvo.org/id/iso639-3/cze')
      publication_7.add_authorized('format', 'http://data.deichman.no/format#MP3-CD')
      publication_7.add_authorized('hasMediaType', 'http://data.deichman.no/mediaType#Book')
      @publication_uris << post_ntriples('publication', publication_7.to_ntriples)

      publication_8 = Entity.new('http://data.deichman.no/publication/p8', @services)
      publication_8.add_authorized('publicationOf', work_uri)
      publication_8.add_literal('mainTitle', "pubprefix3#{@id} #{@id}cze")
      publication_8.add_literal('publicationYear', '2000')
      publication_8.add_authorized('language', 'http://lexvo.org/id/iso639-3/cze')
      publication_8.add_authorized('format', 'http://data.deichman.no/format#DVD')
      publication_8.add_authorized('hasMediaType', 'http://data.deichman.no/mediaType#Book')
      @publication_uris << post_ntriples('publication', publication_8.to_ntriples)

      publication_9 = Entity.new('http://data.deichman.no/publication/p9', @services)
      publication_9.add_authorized('publicationOf', work_uri)
      publication_9.add_literal('mainTitle', "pubprefix0#{@id} #{@id}swe")
      publication_9.add_authorized('language', 'http://lexvo.org/id/iso639-3/swe')
      publication_9.add_authorized('format', 'http://data.deichman.no/format#DVD')
      publication_9.add_authorized('hasMediaType', 'http://data.deichman.no/mediaType#Book')
      @publication_uris << post_ntriples('publication', publication_9.to_ntriples)
      publication_9_uri = @publication_uris.last

      publication_10 = Entity.new('http://data.deichman.no/publication/p10', @services)
      publication_10.add_authorized('publicationOf', work_uri)
      publication_10.add_literal('mainTitle', "pubprefix1#{@id} #{@id}swe")
      publication_10.add_authorized('language', 'http://lexvo.org/id/iso639-3/swe')
      publication_10.add_authorized('format', 'http://data.deichman.no/format#DVD')
      publication_10.add_authorized('hasMediaType', 'http://data.deichman.no/mediaType#MusicRecording')
      @publication_uris << post_ntriples('publication', publication_10.to_ntriples)

      publication_11 = Entity.new('http://data.deichman.no/publication/p11', @services)
      publication_11.add_authorized('publicationOf', work_uri)
      publication_11.add_literal('mainTitle', "pubprefix2#{@id} #{@id}nob")
      publication_11.add_literal('publicationYear', '1900')
      publication_11.add_authorized('language', 'http://lexvo.org/id/iso639-3/nob')
      publication_11.add_authorized('format', 'http://data.deichman.no/format#DVD')
      @publication_uris << post_ntriples('publication', publication_11.to_ntriples)

      ids = self.get_record_ids([publication_9_uri, publication_4_uri])
      self.add_item(ids.first, true, 'placement1', branchcode, 1)
      self.add_item(ids.first, false, 'placement2', branchcode, 2)
      self.add_item(ids.first, false, 'placement1', branchcode, 3)
      self.add_item(ids.last, false, 'placement1', branchcode, 1)

      index('work', work_uri)

      work_uri
    end

    def get_record_data(work_uri, publication_uri)
      res = RestClient.get "#{proxy_to_services(work_uri)}/items"
      items = JSON.parse(res)
      res = RestClient.get "#{proxy_to_services(publication_uri)}"
      publication = JSON.parse(res)
      {
          publication_recordid: publication['deichman:recordId'],
          item_barcode: items['deichman:barcode']
      }
    end

    def get_record_id(uri)
      res = RestClient.get "#{proxy_to_services(uri)}"
      JSON.parse(res)['deichman:recordId']
    end

    def get_record_ids(publication_uris = nil)
      record_ids = []
      (publication_uris || @publication_uris).each do |uri|
        res = RestClient.get "#{proxy_to_services(uri)}", {'accept': 'application/ld+json;charset=utf-8'}
        record_ids << JSON.parse(res)['deichman:recordId']
      end
      record_ids
    end
  end
end