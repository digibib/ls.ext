#!/usr/bin/env ruby
require 'sinatra'
require 'rdf'
require 'json/ld'
require_relative './rest_service.rb'
require_relative './work_model.rb'

set :server, 'webrick'
set :bind, '0.0.0.0'
enable :static
set :public_folder, File.dirname(__FILE__) + '/public'

get '/' do
  "Catalinker"
end

get '/work' do
  location = params['location']
  if location then
    RESTService.pull(:work, { :location => location })
  else
    redirect '/index.html'
  end
end

get '/work/:id' do |id|
  RESTService.pull(:work, {:id => id }) # just passing on the content for now
end

get '/item' do
  "Item"
end

post '/work', :provides => 'text' do

  data =
      { :id => params[:id],
        :creator => params[:creator],
        :title => {
            :string => params[:title],
            :language => params[:language]
        },
        :biblio => params[:biblio],
        :date => {
            :string => params[:date],
            :datatype => params[:datatype]
        }
      }
      puts data
  model = WorkModel.fromData(data)
  json = model.dump(:jsonld, standard_prefixes: true)
  resp = RESTService.push("work", json)
  location = resp.headers[:location]
  redirect to("/work?location=#{location}")
end
