#!/usr/bin/env ruby
require 'sinatra'
require 'json'

set :server, 'webrick'
set :bind, '0.0.0.0'
enable :static
set :public_folder, File.dirname(__FILE__) + '/public'
use Rack::Deflater

get '/' do
  haml :index
end

get '/cataloguing*' do
  send_file File.join(settings.public_folder, 'index.html')
end

# Used by catalinker client
get '/config' do
  {
      :ontologyUri => (ENV['SERVICES_PORT'] || 'http://192.168.50.12:8010').sub(/^tcp:\//, 'http:/' ) + '/ontology',
      :resourceApiUri => (ENV['SERVICES_PORT'] || 'http://192.168.50.12:8010').sub(/^tcp:\//, 'http:/' ) + '/'
  }.to_json
end

get '/work' do
  redirect '/cataloguing/work'
end

get '/publication' do
  redirect '/cataloguing/publication'
end

__END__

@@ layout
%html
  = yield

@@ index
.title Catalinker - metadataregistrering med lenkede data
.links
  %ul
    %li
      %a{:href => 'work'} Registrere verk
    %li
      %a{:href => 'publication'} Registrere utgivelse
