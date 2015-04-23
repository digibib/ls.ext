#!/usr/bin/env ruby
require 'sinatra'
require 'rdf'
require 'json/ld'
require_relative './RESTService.rb'

set :bind, '0.0.0.0'
enable :static
set :public_folder, File.dirname(__FILE__) + '/public'

get '/' do
  "Catalinker"
end

get '/work' do
  redirect '/index.html'
end

get '/item' do
  "Item"
end

post '/work', :provides => 'text' do
  title = Hash.new 
  title['string'] = params['title']
  title['language'] = params['language']
  
  date = Hash.new
  date['string'] = params['date']
  date['language'] = params['datatype']

  data = Hash.new
  data['id'] = params['id']
  data['creator'] = params['creator']
  data['title'] = title
  data['biblio'] = params['biblio']
  data['date'] = date

  r = RESTService.new
  model = r.process_work(data)
  resp = r.push_work(model.dump(:jsonld, standard_prefixes: true))
  m = model.dump(:jsonld, standard_prefixes: true)
  "Success: #{m}: #{resp.inspect}"
  
end