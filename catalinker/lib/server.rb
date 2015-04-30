#!/usr/bin/env ruby
require 'sinatra'
require 'rdf'
require 'json/ld'
require_relative './rest_service.rb'
require_relative './work_model.rb'
require 'pry'

set :server, 'webrick'
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

  model = WorkModel.fromData(data)
  resp = RESTService.push(:work, model.dump(:jsonld, standard_prefixes: true))
  m = model.dump(:jsonld, standard_prefixes: true)
  "Success: #{m}: #{resp.inspect}"
end
