# encoding: utf-8

# http://stackoverflow.com/questions/735073/best-way-to-require-all-files-from-a-directory-in-ruby
Dir[File.dirname(__FILE__) + '/pages/*.rb'].each {|file| require file }

class Site

  def initialize(browser)
    @browser = browser
    # create methods for each type of page
    ObjectSpace.each_object(Class).select { |klass| klass < PageRoot }.each do |klazz|
      self.class.send(:define_method, klazz.name.to_sym) { klazz.new(self) }
    end
  end

  def browser
    @browser
  end

end
