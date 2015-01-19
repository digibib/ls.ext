# encoding: UTF-8

Given(/^at det finnes en avdeling$/) do
  step "jeg legger inn en ny avdeling med ny avdelingskode"
end

Given(/^at det er valgt en avdeling$/) do
  step 'at det finnes en avdeling'
  Branches.new(@browser).go.select_branch()
end

Given(/^at jeg har en liste over avdelinger$/) do
  @branches = File.join(File.dirname(__FILE__), '..', 'upload-files', 'branches.csv')
end

When(/^jeg velger å vise alle avdelinger$/) do
  Branches.new(@browser).show_all
end

When(/^jeg er på administrasjonssiden for avdelinger$/) do
  Branches.new(@browser).go
end

When(/^jeg legger inn en ny avdeling med ny avdelingskode$/) do
  branch = Branch.new
  Branches.new(@browser).go.create(branch.name, branch.code)

  @active[:branch] = branch
  (@context[:branches] ||= []) << branch
  @branch = branch

  @cleanup.push( "avdeling #{branch.code}" =>
    lambda do
      Branches.new(@browser).go.filter(@context[:branchname]).delete(branch.name, branch.code)
    end
  )
end

Then(/^finnes avdelingen i oversikten over avdelinger$/) do
  Branches.new(@browser).go.filter(@active[:branch].name).exists(@active[:branch].name, @active[:branch].code)
end


Then(/^samsvarer listen i grensesnittet med liste over avdelinger$/) do
  Branches.new(@browser).all_exists(@branches)
end
