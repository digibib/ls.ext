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
    assert last_response.body.include? 'Catalinker'
  end

  def test_it_serves_config_for_client
    get '/config'
    assert last_response.ok?
  end

  def test_it_has_a_work_page
    get '/work'
    follow_redirect!
    assert last_response.ok?
  end

  def test_it_has_a_publication_page
    get '/publication'
    follow_redirect!
    assert last_response.ok?
  end

end
