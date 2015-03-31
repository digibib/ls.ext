ENV['RACK_ENV'] = 'test'
require 'server'
require 'test/unit'
require 'rack/test'

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
  	assert last_response.ok?
  	assert_equal 'Work', last_response.body
  end

  def test_it_has_a_item_page
  	get '/item'
  	assert last_response.ok?
  	assert_equal 'Item', last_response.body
  end

end
