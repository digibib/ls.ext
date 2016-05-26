require 'securerandom'
require 'rest-client'
require 'json'
require 'pry'

module RandomMigrate
  class Entity
    def initialize(type, services)
      @services = services
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

    def add_item(available, placement, branchcode)
      barcode = SecureRandom.hex(8)
      type = "item-#{barcode}"
      add_raw("<publication> <#{@services}/ontology#hasItem> <#{type}> .
               <#{type}> <#{@services}/itemSubfieldCode/a> \"#{branchcode}\" .
               <#{type}> <#{@services}/itemSubfieldCode/b> \"#{branchcode}\" .
               <#{type}> <#{@services}/itemSubfieldCode/l> \"12\" .
               <#{type}> <#{@services}/itemSubfieldCode/o> \"#{placement}\" .
               <#{type}> <#{@services}/itemSubfieldCode/p> \"#{barcode}\" .
               <#{type}> <#{@services}/itemSubfieldCode/t> \"#{@raw.size}\" .
               <#{type}> <#{@services}/itemSubfieldCode/y> \"l\" .
               #{"<#{type}> <#{@services}/itemSubfieldCode/q> \"2011-06-20\" ." unless available}"
      )
    end

    def to_ntriples()
      ntriples = "<#{@type}> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <#{@services}/ontology##{@type.capitalize}> .\n"
      @literals.each do |predicate, value|
        ntriples << "<#{@type}> <#{@services}/ontology##{predicate}> \"#{value}\" .\n"
      end
      @authorized_values.each do |predicate, value|
        ntriples << "<#{@type}> <#{@services}/ontology##{predicate}> <#{value}> .\n"
      end
      @raw.each do |raw|
        ntriples << "#{raw}\n"
      end
      ntriples
    end
  end

  class Migrator
    def initialize(services)
      @id = generate_random_string
      @services = services
      @formats = %w(Audiobook Book DVD Microfiche Compact_Disc Blu-ray_Audio E-book)
      @languages = %w(http://lexvo.org/id/iso639-3/eng http://lexvo.org/id/iso639-3/dan http://lexvo.org/id/iso639-3/nob http://lexvo.org/id/iso639-3/fin http://lexvo.org/id/iso639-3/jpn http://lexvo.org/id/iso639-3/swe)
      @audiences = %w(juvenile ages11To12 ages13To15 ages13To15)
      @publication_uris = []
    end

    def generate_random_string()
      return SecureRandom.hex(8)
    end

    def generate_person()
      person_name = generate_random_string
      ntriples = "<person> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <#{@services}/ontology#Person> .
                  <person> <#{@services}/ontology#name> \"#{person_name}\" ."
      return person_name, ntriples
    end

    def generate_work(person_uri, prefix = '')
      work_title = generate_random_string
      work_part_title = generate_random_string
      ntriples = "<work> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <#{@services}/ontology#Work> .
                  <work> <#{@services}/ontology#mainTitle> \"#{prefix} #{work_title}\" .
                  <work> <#{@services}/ontology#partTitle> \"#{prefix} #{work_part_title}\" .
                  <work> <#{@services}/ontology#audience> <http://data.deichman.no/audience##{@audiences.sample}> .
                  <work> <#{@services}/ontology#contributor> _:c1 .
                  _:c1 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <#{@services}/ontology#Contribution> .
                  _:c1 <#{@services}/ontology#agent> <#{person_uri}> .
                  _:c1 <#{@services}/ontology#role> <http://data.deichman.no/role#author> ."
      return work_title, ntriples
    end

    def generate_publication(work_uri, language = nil, prefix = nil)
      publication_title = generate_random_string
      ntriples = "<publication> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <#{@services}/ontology#Publication> .
                  <publication> <#{@services}/ontology#publicationOf> <#{work_uri}> .
                  <publication> <#{@services}/ontology#mainTitle> \"#{prefix} #{publication_title}\" .
                  <publication> <#{@services}/ontology#format> <http://data.deichman.no/format##{@formats.sample}> .
                  <publication> <#{@services}/ontology#language> <#{language || @languages.sample}> ."
      return publication_title, ntriples
    end

    def post_ntriples(type, ntriples)
      response = RestClient.post "#{@services}/#{type}", ntriples, :content_type => 'application/n-triples'
      uri = response.headers[:location]
      return uri
    end

    def index(type, uri)
      id = uri[uri.rindex('/')+1..-1]
      response = RestClient.put "#{@services}/#{type}/#{id}/index", {}
      return response
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
      # Work page has four publications
      # The Norwegian publication has three items, one available and two unavailable
      # The available item has the same placement as one of the unavailable items
      # One of the English publications has one unavailable item
      specialized_migrate(branchcode)

      return @id
    end

    def random_migrate(number_of_persons, number_of_works_per_person, number_of_publications_per_work, prefix)
      number_of_persons.times do
        person_uri = post_ntriples 'person', generate_person[1]
        number_of_works_per_person.times do
          work_uri = post_ntriples('work', generate_work(person_uri, prefix)[1])
          number_of_publications_per_work.times do
            @publication_uris << post_ntriples('publication', generate_publication(work_uri, nil, prefix)[1])
          end
          index('work', work_uri)
        end
      end
      return @id
    end

    def specialized_migrate(branchcode)
      person_uri = post_ntriples 'person', generate_person[1]
      work_uri = post_ntriples('work', generate_work(person_uri)[1])

      publication_1 = Entity.new('publication', @services)
      publication_1.add_authorized('publicationOf', work_uri)
      publication_1.add_literal('mainTitle', "pubprefix0#{@id} #{@id}nob")
      publication_1.add_authorized('language', 'http://lexvo.org/id/iso639-3/nob')
      publication_1.add_item(true, 'placement1', branchcode)
      publication_1.add_item(false, 'placement2', branchcode)
      publication_1.add_item(false, 'placement1', branchcode)
      @publication_uris << post_ntriples('publication', publication_1.to_ntriples)

      publication_2 = Entity.new('publication', @services)
      publication_2.add_authorized('publicationOf', work_uri)
      publication_2.add_literal('mainTitle', "pubprefix0#{@id} #{@id}eng")
      publication_2.add_authorized('language', 'http://lexvo.org/id/iso639-3/eng')
      @publication_uris << post_ntriples('publication', publication_2.to_ntriples)

      publication_3 = Entity.new('publication', @services)
      publication_3.add_authorized('publicationOf', work_uri)
      publication_3.add_literal('mainTitle', "pubprefix1#{@id} #{@id}eng")
      publication_3.add_authorized('language', 'http://lexvo.org/id/iso639-3/eng')
      @publication_uris << post_ntriples('publication', publication_3.to_ntriples)

      publication_4 = Entity.new('publication', @services)
      publication_4.add_authorized('publicationOf', work_uri)
      publication_4.add_literal('mainTitle', "pubprefix1#{@id} #{@id}dan")
      publication_4.add_authorized('language', 'http://lexvo.org/id/iso639-3/dan')
      publication_4.add_item(false, 'placement1', branchcode)
      @publication_uris << post_ntriples('publication', publication_4.to_ntriples)

      index('work', work_uri)

      work_uri
    end

    def get_record_data(work_uri, publication_uri)
      res = RestClient.get "#{work_uri}/items"
      items = JSON.parse(res)
      res = RestClient.get "#{publication_uri}"
      publication = JSON.parse(res)
      return {
        :publication_recordid => publication["deichman:recordID"],
        :item_barcode => items["deichman:barcode"]
      }
    end

    def get_record_ids
      record_ids = []
      @publication_uris.each do | uri |
        res = RestClient.get "#{uri}"
        record_ids << JSON.parse(res)["deichman:recordID"]
      end
      record_ids
    end
  end
end