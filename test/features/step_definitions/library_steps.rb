# encoding: UTF-8

Given(/^at det finnes en avdeling$/) do
  @context[:branches] = @context[:defaults][:branches]
end

When(/^jeg er på administrasjonssiden for avdelinger$/) do
  @site.Branches.visit
end

When(/^jeg legger inn en ny avdeling med ny avdelingskode$/) do
  branch = Branch.new
  @site.Branches.visit.create(branch.name, branch.code)

  (@context[:defaults][:branches] ||= []) << branch
  @branch = branch

  @cleanup.push( "avdeling #{branch.code}" =>
    lambda do
      @site.Branches.visit.filter(branch.name).delete(branch.code)
    end
  )
end
