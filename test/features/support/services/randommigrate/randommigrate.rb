require 'securerandom'
require 'rest-client'
require 'pry'

module RandomMigrate
  class Migrator
    def initialize(services)
      @id = generate_random_string
      @services = services
      @formats = %w(Atlas Book DVD Microfiche Nintendo_optical_disc Blu-ray_Audio DTbook)
      @languages = %w(http://lexvo.org/id/iso639-3/eng http://lexvo.org/id/iso639-3/dan http://lexvo.org/id/iso639-3/nob http://lexvo.org/id/iso639-3/fin http://lexvo.org/id/iso639-3/mul http://lexvo.org/id/iso639-3/swe)
      @a = %w(largeFontMeasured braille tactile capitalLetters)
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
                  <work> <#{@services}/ontology#creator> <#{person_uri}> ."
      return work_title, ntriples
    end

    def generate_publication(work_uri)
      publication_title = generate_random_string
      ntriples = "<publication> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <#{@services}/ontology#Publication> .
                  <publication> <#{@services}/ontology#publicationOf> <#{work_uri}> .
                  <publication> <#{@services}/ontology#mainTitle> \"#{publication_title}\" .
                  <publication> <#{@services}/ontology#format> <#{'http://data.deichman.no/format#' + @formats.sample}> .
                  <publication> <#{@services}/ontology#language> <#{@languages.sample}> .
                  <publication> <#{@services}/ontology#adaptationOfPublicationForParticularUserGroups> <http://data.deichman.no/format#adaptationOfPublicationForParticularUserGroups#{@a.sample}> ."
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

    def generate_quick_test_set()
      # For Patron client
      # For search on prefix0#{@id}, get two pages with 10 and 6 results
      # For search on prefix1#{@id}, get one page with 1 results
      # Generated publications shall trigger filters for language and format
      puts 'Migrating quick test set'
      random_migrate(16, 1, 2, "prefix0#{@id}")
      random_migrate(1, 1, 2, "prefix1#{@id}")
      return @id
    end

    def random_migrate(number_of_persons, number_of_works_per_person, number_of_publications_per_work, prefix)
      number_of_persons.times do
        person_uri = post_ntriples 'person', generate_person[1]
        number_of_works_per_person.times do
          work_uri = post_ntriples('work', generate_work(person_uri, prefix)[1])
          number_of_publications_per_work.times do
            post_ntriples('publication', generate_publication(work_uri)[1])
          end
          index('work', work_uri)
        end
      end
      return @id
    end
  end
end