#!/usr/bin/env ruby
# encoding: utf-8

require 'socket'
require 'time'

class SIP2Client
  attr_accessor :socket

  def initialize(host, port)
    @socket = TCPSocket.open(host.to_s, port.to_i)
  end

  def connect
    send("9300CNautouser|COautopass|")
  end

  def status
    send("9900302.00")
  end

  def userlogin(branch,user,pin)
    lang = "012" # Norwegian
    timestamp = Time.now.strftime("%Y%m%d    %H%M%S")
    send("63#{lang}#{timestamp}          AO#{branch}|AA#{user}|AC#{pin}|")
  end

  def checkout(branch,user,pin,barcode)
    timestamp = Time.now.strftime("%Y%m%d    %H%M%S")
    send("11YN#{timestamp}                  AO#{branch}|AA#{user}|AB#{barcode}|AC#{pin}|BON|BIN|")
  end

  def checkin(branch,barcode)
    timestamp = Time.now.strftime("%Y%m%d    %H%M%S")
    send("09N#{timestamp}#{timestamp}AP|AO#{branch}|AB#{barcode}|AC|BIN|")
  end

  def userlogout(branch,user)
    timestamp = Time.now.strftime("%Y%m%d    %H%M%S")
    send("35#{timestamp}AO#{branch}|AA#{user}|")
  end

  def send(msg)
    begin
      @socket.send(msg+"\r", 0)   # Add <CR> and infinite length

      result = @socket.recv(2048) # max buffer - 2048 bytes
      return result
    rescue SystemCallError => e
      raise e
    end
  end

  def close
    @socket.close
  end

end
