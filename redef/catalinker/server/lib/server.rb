#!/usr/bin/env ruby
require 'sinatra'
require 'json'

set :server, 'webrick'
set :bind, '0.0.0.0'
enable :static
set :public_folder, File.dirname(__FILE__) + '/public'
use Rack::Deflater

get '/' do
  "Catalinker"
end

# Used by catalinker client
get '/config' do
  {
      :ontologyUri => (ENV['SERVICES_PORT'] || 'http://192.168.50.12:8010').sub(/^tcp:\//, 'http:/' ) + '/ontology',
      :resourceApiUri => (ENV['SERVICES_PORT'] || 'http://192.168.50.12:8010').sub(/^tcp:\//, 'http:/' ) + '/'
  }.to_json
end

get '/work' do
  redirect '/index.html'
end
