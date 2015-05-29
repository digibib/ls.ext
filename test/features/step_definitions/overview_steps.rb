# encoding: UTF-8

Given(/^at jeg er på oversiktssiden$/) do
  page = @site.Overview.visit
  page.title.should match(/oversikt/i)
end

Then(/^skal jeg finne lenke til Kohas OPAC$/) do
  @site.Overview.link_exists?({:text => /OPAC/}).should == true
end


When(/^skal jeg finne lenker til:$/) do |table|
  not_found = table.rows.flatten.reject do | item |
    @site.Overview.link_exists?({:text => %r/#{item}/i})
  end
  not_found.length.should(be(0), "Links not found: #{not_found}")
end
