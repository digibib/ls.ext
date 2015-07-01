ENV['RACK_ENV'] = 'test'
require 'server.rb'
require 'sinatra'
require 'test/unit'
require 'rack/test'
require 'webmock'
require 'webmock/test_unit'


class TestServer < Test::Unit::TestCase
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

  def test_it_serves_config_for_client
    get '/config'
    assert last_response.ok?
  end


  def test_can_post_a_work
    stub_request(:post, "http://192.168.50.12:8080/work").
        with(:body =>
                 {
                     "@id" => "http://example.com/placeholder",
                     "@type" => "http://deichman.no/ontology#Work",
                     "http://deichman.no/ontology#creator" => "Sarah Smith",
                     "http://deichman.no/ontology#year" => "2009",
                     "http://deichman.no/ontology#name" => "This is a test",
                     "http://deichman.no/ontology#biblio" => "2"
                 },
         :headers => {'Content-Type'=>'application/json'}).
    to_return(:status => 201, :body => "", :headers => { 'Location' => 'http://192.168.50.12:8080/work/w12' })

    post '/work', params = {:title => "This is a test", :creator => "Sarah Smith", :year => "2009", :biblio => "2"}

    assert last_response.redirect?, 'Response from catalinker should be redirect'
    assert_equal URI.encode('http://example.org/work?location=http://192.168.50.12:8080/work/w12'), last_response['Location']
  end

  def test_can_show_a_work_using_location
    stub_request(:get, "http://192.168.50.12:8080/work/w12").
        with(:headers => {'Accept-Encoding'=>'json'}).
        to_return(:status => 200, :body => '{
                                    "@id" : "http://192.168.50.12:8080/work/w12",
                                    "@type" : "http://deichman.no/ontology#Work",
                                    "http://deichman.no/ontology#biblio" : "3",
                                    "http://deichman.no/ontology#creator" : "Sarah Smith",
                                    "http://deichman.no/ontology#year" : "2015",
                                    "http://deichman.no/ontology#name" : "tittel-blah"
                                }', :headers => {'Content-Type'=>'application/json'})

    get 'work?location=http://192.168.50.12:8080/work/w12'

    assert last_response.ok?
    assert last_response.body.include?('w12')
  end

  def test_can_show_a_work
    stub_request(:get, "http://192.168.50.12:8080/work/work_THIS_EXISTS").
        with(:headers => {'Accept-Encoding'=>'json'}).
        to_return(:status => 200, :body => '{
                                    "@id" : "http://192.168.50.12:8080/work/work_THIS_EXISTS",
                                    "@type" : "http://deichman.no/ontology#Work",
                                    "http://deichman.no/ontology#biblio" : "3",
                                    "http://deichman.no/ontology#creator" : "Sarah Smith",
                                    "http://deichman.no/ontology#year" : "2015",
                                    "http://deichman.no/ontology#name" : "tittel-blah"
                                }', :headers => {'Content-Type'=>'application/json'})

    get 'work/work_THIS_EXISTS'

    assert last_response.ok?
    assert last_response.body.include?('work_THIS_EXISTS')
  end

  def test_it_has_a_item_page
    get '/item'
    assert last_response.ok?
    assert_equal 'Item', last_response.body
  end

end
