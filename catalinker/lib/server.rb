#!/usr/bin/env ruby
require 'sinatra'

set :bind, '0.0.0.0'

get '/' do
  "Catalinker"
end

get '/work' do
  "Work"
end

get '/item' do
  "Item"
end