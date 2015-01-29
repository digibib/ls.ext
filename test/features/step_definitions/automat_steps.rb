# encoding: UTF-8
require_relative '../support/SIP2Client.rb'

#############################
# AUTOMAT CIRCULATION STEPS
#############################

# Automat user should not be deleted after creation
Given(/^at det finnes en utlånsautomat$/) do
  step "at jeg er logget inn som adminbruker"
  unless user_exists?("Automat")
    # prereq: library
    branchcode   = generateRandomString
    branchname   = generateRandomString
    categorycode = generateRandomString
    categorydesc = generateRandomString

    @browser.goto intranet(:branches)
    @browser.link(:id => "newbranch").click
    form = @browser.form(:name => "Aform")
    form.text_field(:id => "branchname").set branchname
    form.text_field(:id => "branchcode").set branchcode
    form.submit

    # prereq: patron category type
    @browser.goto intranet(:patron_categories)
    @browser.link(:id => "newcategory").click
    form = @browser.form(:name => "Aform")
    form.text_field(:id => "categorycode").set categorycode
    form.text_field(:id => "description").set categorydesc
    form.select_list(:id => "category_type").select "Staff"
    form.text_field(:id => "enrolmentperiod").set "1"  # Months
    form.submit

    # user
    @browser.goto intranet(:patrons)
    @browser.button(:text => "New patron").click
    @browser.div(:class => "btn-group").ul(:class => "dropdown-menu").a(:text => categorydesc).click
    form = @browser.form(:name => "form")
    form.text_field(:id => "firstname").set "Audun"
    form.text_field(:id => "surname").set "Automat"
    form.text_field(:id => "userid").set "autouser"
    form.text_field(:id => "password").set "autopass"
    form.text_field(:id => "password2").set "autopass"
    form.button(:name => "save").click

    step "at bruker \"Automat\" har rettighet \"circulate\""
  end
end

Given(/^at låneren har identifisert seg for å låne på utlånsautomaten$/) do
  step "låneren velger \"låne\" på automaten"
  step "låneren identifiserer seg på automat med riktig PIN"
end

Given(/^at materialet( ikke)? har riktig antall RFID\-brikker$/) do |bool|
  next # This is actually handled by RFID adapter and is outside the scope of automats
end

When(/^låneren legger materialet på automaten$/) do
  step "\"Knut\" legger materialet på automaten"
end

When(/^"(.*?)" legger materialet på automaten$/) do |name|
  branch = @active[:branch]
  patron = @context[:patrons].find {|p| p.firstname == "#{name}" }
  item   = @active[:item] || @active[:book].items.first
  case @context[:sip_mode]
  when "låne"
    @context[:sip_transaction_response] = @context[:sip_client].checkout(branch.code, patron.cardnumber, patron.password, item.barcode)
    @cleanup.push( "utlån #{item.barcode}" =>
      lambda do
        @context[:sip_client].checkin(branch.code,item.barcode)
      end
    )
  when "levere"
    @context[:sip_transaction_response] = @context[:sip_client].checkin(branch.code,item.barcode)
  else
    raise Exception.new("Invalid SIP mode: #{@context[:sip_mode]}")
  end
end

When(/^låneren velger "(.*?)" på automaten$/) do |mode|
  sip = SIP2Client.new("192.168.50.12", 6001)
  res = sip.connect
  res[:statusCode].should eq("Login_Response")
  res[:statusData].should eq("1")

  res = sip.status
  res[:statusCode].should eq("ACS_Status")
  res[:statusData].should include("YYYYNN100005")
  res["BX"].should eq("YYYYYYYYYYYNYYYY")

  @context[:sip_client] = sip
  @context[:sip_mode]   = mode
  @cleanup.push( "SIP2 connection" =>
    lambda do
      @context[:sip_client].close
    end
  )
end

When(/^låneren identifiserer seg på automat med (riktig|feil) PIN$/) do | pin |
  pin == "riktig" ? pin = @active[:patron].password : pin = "0000"
  @context[:sip_patron_information] = @context[:sip_client].userlogin(@active[:patron].branch.code,
                                                                      @active[:patron].cardnumber,
                                                                      pin)
  @context[:sip_patron_information]["AE"].should include("Knut #{@active[:patron].surname}")
end

Then(/^får låneren beskjed om at PIN( ikke)? er riktig$/) do |invalidpin|
  validpin = invalidpin ? "N" : "Y"
  @context[:sip_patron_information]["CQ"].should eq(validpin)
end

Then(/^får låneren beskjed om at lånekort( ikke)? er gyldig$/) do |invalidcard|
  validcard = invalidcard ? "N" : "Y"
  @context[:sip_patron_information]["BL"].should eq(validcard)
end

Then(/^får låneren beskjed om at lånekort er sperret$/) do
  @context[:sip_patron_information][:statusData][0...4].should eq("YYYY")
end

Then(/^får låneren mulighet til å registrere lån på automaten$/) do
  @context[:sip_patron_information]["AF"].should include("Greetings from Koha.")
  @context[:sip_patron_information][:statusData][0...4].should_not include("Y") # 'Y' in any of these fields denote privileges denied
end

Given(/^at materialet som forsøkes innlevert ikke har riktig antall brikker$/) do
  next    # This is actually handled by RFID adapter and is outside the scope of automats
end

When(/^innlevering blir valgt på automaten$/) do
  step "låneren velger \"levere\" på automaten"
end

Then(/^systemet viser at materialet fortsatt er utlånt til låner$/) do
  pending # express the regexp above with the code you wish you had
end

Then(/^får låneren beskjed om at materialet (.*?)$/) do |check|
  if check =~ /^(ikke|overskrider)/
    @context[:sip_transaction_response][:statusData][0].should eq("0")  # NOT OK
    @context[:sip_transaction_response][:statusData][1].should eq("N")  # Renewal OK?
    @context[:sip_transaction_response][:statusData][2].should eq("U")  # Magnetic media?
    step "systemet viser at alarm ikke er deaktivert"
    @context[:sip_transaction_response]["AH"].should eq("")             # Empty due date
  else
    @context[:sip_transaction_response][:statusData][0].should eq("1")  # OK
    step "systemet viser at alarm er deaktivert"
  end

  case check
  when "er registrert utlånt"
    @context[:sip_transaction_response]["AF"].should == nil             # Empty message
    @context[:sip_transaction_response]["AH"].should_not eq("")         # Due date
  when "ikke er til utlån"
    @context[:sip_transaction_response]["AF"].should include("NOT_FOR_LOAN")
  when "ikke er komplett"
    next # This is handle by automat
  when "ikke kan lånes"
    @context[:sip_transaction_response]["AF"].should include("Item is on hold shelf for another patron")
  when "overskrider maksgrensen for lån"
    @context[:sip_transaction_response]["AF"].should eq("1") # TODO! This should be a more meaningful response ?!?!
  when "ikke kan lånes pga aldersbegrensning"
    @context[:sip_transaction_response]["AF"].should eq("AGE_RESTRICTION: Aldersgrense: 15")
  end
end

Then(/^systemet viser at alarm( ikke)? er deaktivert$/) do |bool|
  if bool
    @context[:sip_transaction_response][:statusData][3].should eq("N") # Not Desensitized
  else
    @context[:sip_transaction_response][:statusData][3].should eq("Y") # Desensitized
  end
end
