ENV['RACK_ENV'] = 'test'
require 'server'
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
    STDOUT.puts last_response.inspect 
    assert last_response.ok?
  end

  def test_it_has_a_work_data_service

    post '/work', params = {:id => "work_THIS_EXISTS", :title => "This is a test", :creator => "http://example.com/person1", :date => "2009"}
    assert last_response.ok?
  end

  def test_it_has_a_item_page
    get '/item'
    assert last_response.ok?
    assert_equal 'Item', last_response.body
  end

end
