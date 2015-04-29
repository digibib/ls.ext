ENV['RACK_ENV'] = 'test'
require 'server'
require 'sinatra'
require 'test/unit'
require 'rack/test'
require 'webmock'
require 'webmock/test_unit'


class ServerTest < Test::Unit::TestCase
  include Rack::Test::Methods

  def app
    Sinatra::Application
  end

  def test_it_says_hello_world
    get '/'
    assert last_response.ok?
    assert_equal 'Catalinker', last_response.body
  end

  def test_it_has_a_work_page
    get '/work'
    follow_redirect!
    assert last_response.ok?
  end

  def test_it_has_a_work_data_service
    stub_request(:post, "http://192.168.50.50:8080/work").
        with(:body =>
                 {
                     "@context" => { "dc" => "http://purl.org/dc/terms/" },
                     "@id" => "http://deichman.no/work/work_THIS_EXISTS",
                     "@type" => "http://deichman.no/ontology#Work",
                     "dc:creator" => { "@id" => "http://example.com/person1" },
                     "dc:date" => "2009",
                     "dc:identifier" => "work_THIS_EXISTS",
                     "dc:title" => "This is a test",
                     "http://deichman.no/ontology#biblioId" => "2"
                 },
         :headers => {'Content-Type'=>'application/json'}).
    to_return(:status => 201, :body => "", :headers => {})

    post '/work', params = {:id => "work_THIS_EXISTS", :title => "This is a test", :creator => "http://example.com/person1", :date => "2009", :biblio => "2"}
    assert last_response.ok?
  end

  def test_it_has_a_item_page
    get '/item'
    assert last_response.ok?
    assert_equal 'Item', last_response.body
  end

end
