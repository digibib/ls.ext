# unused.rb
#   cucumber -d -f Unused
require 'cucumber/formatter/stepdefs'

class Unused < Cucumber::Formatter::Stepdefs
  def print_summary
    add_unused_stepdefs
    aggregate_info

    @stepdef_to_match.keys
      .sort_by { |stepdef| [stepdef.location.file, -stepdef.location.lines.first] }
      .select { |stepdef| @stepdef_to_match[stepdef].none? }
      .each do |stepdef|
        $stdout.puts "#{stepdef.location.file}:#{stepdef.location.lines.first} # #{stepdef.regexp_source}"
      end
  end
end