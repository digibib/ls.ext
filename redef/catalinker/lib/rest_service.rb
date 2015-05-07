require 'uri'
require 'rest-client'

class RESTService

  SERVICES_PORT = (ENV['SERVICES_PORT'] || 'http://192.168.50.50:8080').sub(/^tcp:\//, 'http:/' )

  def self.push (resource, data)
    RestClient.post SERVICES_PORT + '/' + resource.to_s, data, :content_type => :json
  end

  def self.pull (resource, id)
    RestClient.get "#{SERVICES_PORT}/#{resource.to_s}/#{id}", :accept_encoding => :json
  end

end