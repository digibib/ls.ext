#!/usr/bin/env ruby
# encoding: utf-8

# SIP2 specification here:
# http://multimedia.3m.com/mws/media/355361O/sip2-protocol.pdf

require 'socket'
require 'time'
require_relative '../service.rb'

class SIP2Client < Service
  attr_accessor :socket

  def msgType(code)
    codes = {
      "09" => "Checkin",
      "10" => "Checkin_Response",
      "11" => "Checkout",
      "12" => "Checkout_Response",
      "15" => "Hold",
      "16" => "Hold_Response",
      "17" => "Item_Information",
      "18" => "Item_Information_Response",
      "19" => "Item_Status_Update",
      "20" => "Item_Status_Update_Response",
      "23" => "Patron_Status",
      "24" => "Patron_Status_Response",
      "25" => "Patron_Enable",
      "26" => "Patron_Enable_Response",
      "29" => "Renew",
      "30" => "Renew_Response",
      "35" => "End_Patron_Session",
      "36" => "End_Session_Response",
      "37" => "Fee_Paid",
      "38" => "Fee_Paid_Response",
      "63" => "Patron_Information",
      "64" => "Patron_Information_Response",
      "65" => "Renew_All",
      "66" => "Renew_All_Response",
      "93" => "Login",
      "94" => "Login_Response",
      "98" => "ACS_Status",
      "99" => "SC_Status"
    }
    return codes[code]
  end

  def initialize(host, port)
    @socket = TCPSocket.open(host.to_s, port.to_i)
  end

  def connect(user="autouser",pass="autopass")
    send("9300CN#{user}|CO#{pass}|")
  end

  def status
    send("9900302.00")
  end

  def userlogin(branch,user,pin,date=nil)
    lang = "012" # Norwegian
    timestamp = date ? Date.parse(date).strftime("%Y%m%d    %H%M%S") : Time.now.strftime("%Y%m%d    %H%M%S")
    send("63#{lang}#{timestamp}          AO#{branch}|AA#{user}|AD#{pin}|BP0000|BQ9999|")
  end

  def checkout(branch,user,pin,barcode,date=nil)
    timestamp = date ? Date.parse(date).strftime("%Y%m%d    %H%M%S") : Time.now.strftime("%Y%m%d    %H%M%S")
    send("11YN#{timestamp}                  AO#{branch}|AA#{user}|AB#{barcode}|AD#{pin}|")
  end

  def checkin(branch,barcode,date=nil)
    timestamp = date ? Date.parse(date).strftime("%Y%m%d    %H%M%S") : Time.now.strftime("%Y%m%d    %H%M%S")
    send("09N#{timestamp}#{timestamp}AP|AO#{branch}|AB#{barcode}|AD|BIN|")
  end

  def userlogout(branch,user,date=nil)
    timestamp = date ? Date.parse(date).strftime("%Y%m%d    %H%M%S") : Time.now.strftime("%Y%m%d    %H%M%S")
    send("35#{timestamp}AO#{branch}|AA#{user}|")
  end

  def send(msg)
    begin
      STDERR.puts "Sending SIP-msg: '#{msg}'"
      @socket.puts("#{msg}\r\n")

      result = @socket.gets("\r").chomp("\r")
      STDERR.puts "Received SIP-msg: '#{result.strip}'"
      return renderSIPmessage(result)
    rescue SystemCallError => e
      raise e
    end
  end

  def renderSIPmessage(string)
    hash   = {}
    arr    = string.strip.split("|")    # delimiter
    status = arr.shift                  # first obj is status
    if !status then
      STDERR.puts "Could not parse SIP-message status from: '#{string}'"
      return hash
    end
    hash[:statusCode] = msgType(status[0,2])  # Two first chars is Message Type
    hash[:statusData] = status[2..-1]         # Rest is status message

    # Iterate response items
    arr.each do |item|
      next if item == "|"             # remove trailing garbage
      hash[item[0,2]] = item[2..-1]   # put item in hash
    end
    return hash
  end

  def close
    @socket.close
  end

end
