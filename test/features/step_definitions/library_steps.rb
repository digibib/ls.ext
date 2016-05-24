# encoding: UTF-8

Given(/^at det finnes en avdeling$/) do
  step "jeg legger inn en ny avdeling med ny avdelingskode"
end

Given(/^at det er valgt en avdeling$/) do
  step 'at det finnes en avdeling'
  @site.Branches.visit.select_branch()
end

Given(/^at jeg har en liste over avdelinger$/) do
  @branches = File.join(File.dirname(__FILE__), '..', 'upload-files', 'branches.csv')
end

When(/^jeg velger å vise alle avdelinger$/) do
  @site.Branches.show_all
end

When(/^jeg er på administrasjonssiden for avdelinger$/) do
  @site.Branches.visit
end

When(/^jeg legger inn en ny avdeling med ny avdelingskode$/) do
  branch = Branch.new
  @site.Branches.visit.create(branch.name, branch.code)

  @active[:branch] = branch
  (@context[:branches] ||= []) << branch
  @branch = branch

  @cleanup.push( "avdeling #{branch.code}" =>
    lambda do
      @site.Branches.visit.filter(branch.name).delete(branch.code)
    end
  )
end

Then(/^finnes avdelingen i oversikten over avdelinger$/) do
  @site.Branches.visit.filter(@active[:branch].name).exists(@active[:branch].name, @active[:branch].code)
end


Then(/^samsvarer listen i grensesnittet med liste over avdelinger$/) do
  @site.Branches.all_exists(@branches)
end
