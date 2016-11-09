# encoding: UTF-8

require_relative '../page_root.rb'

class PatronClientForms < PageRoot
  def is_required?(field)
    set(field, '')
    get_validator(field).text.should eq 'Feltet må fylles ut'
  end

  def has_xss_protection?(field)
    set(field, '<img src=/ onerror="console.log(\'xss\')" />')
    get_validator(field).text.should eq 'Feltet inneholder ulovlige karakterer'
  end

  def is_valid?(field, value)
    set(field, value)
    get_validator(field).present?.should eq false
  end

  def is_invalid?(field, value)
    set(field, value)
    validator = get_validator(field)
    validator.present?.should eq true
    validator.text.should start_with('Ugyldig ')
  end

  def triggers_message?(field, value, message)
    set(field, value)
    validator = get_validator(field)
    validator.present?.should eq true
    validator.text.should eq message
  end

  def set(field, value)
    @browser.text_field(id: field).set(value)
    @browser.text_field(id: field).fire_event('onblur')
  end

  def get_validator(field)
    @browser.element(id: field).parent.element(class: 'feedback')
  end
end