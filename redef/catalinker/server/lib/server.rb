#!/usr/bin/env ruby
require 'sinatra'
require 'json'
require 'net/http'

set :server, 'webrick'
set :bind, '0.0.0.0'
enable :static
set :public_folder, File.dirname(__FILE__) + '/public'
use Rack::Deflater

helpers do
  def new_resource(type)
    uri = URI.parse(settings.config[:resourceApiUri]+type)
    http = Net::HTTP.new(uri.host, uri.port)
    req = Net::HTTP::Post.new(uri.path)
    req['Accept'] = "application/ld+json"
    req['Content-Type'] = "application/ld+json"
    req.body = "{}"
    res = http.request(req)
    res['Location']
  end
end

set :config,
    { :kohaOpacUri => (ENV['KOHA_OPAC_PORT'] || 'http://192.168.50.12:8080').sub(/^tcp:\//, 'http:/' ),
      :kohaIntraUri => (ENV['KOHA_INTRA_PORT'] || 'http://192.168.50.12:8082').sub(/^tcp:\//, 'http:/' ),
      :ontologyUri => (ENV['SERVICES_PORT'] || 'http://192.168.50.12:8010').sub(/^tcp:\//, 'http:/' ) + '/ontology',
      :resourceApiUri => (ENV['SERVICES_PORT'] || 'http://192.168.50.12:8010').sub(/^tcp:\//, 'http:/' ) + '/' }

get '/' do
  haml :index
end

get '/cataloguing*' do
  send_file File.join(settings.public_folder, 'index.html')
end

# Used by catalinker client
get '/config' do
  settings.config.to_json
end

get '/work' do
  redirect '/cataloguing/work?resource='+new_resource("work")
end

get '/publication' do
  redirect '/cataloguing/publication?resource='+new_resource("publication")
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
