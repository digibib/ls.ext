require 'uri'
require 'rest-client'

class RESTService

  SERVICES_PORT = (ENV['SERVICES_PORT'] || 'http://192.168.50.12:8080').sub(/^tcp:\//, 'http:/' )

  def self.push (resource, data)
    RestClient.post SERVICES_PORT + '/' + resource.to_s, data, :content_type => :json
  end

  def self.pull (resource, params)
    url = params[:location] || "#{SERVICES_PORT}/#{resource.to_s}/#{params[:id]}"
    RestClient.get url, :accept_encoding => :json
  end

end
