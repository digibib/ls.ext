# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)

Gem::Specification.new do |spec|
  spec.name          = "Catalinker"
  spec.version       = '1.0'
  spec.authors       = ["Digibib Oslo public library"]
  spec.email         = ["digibib@gmail.com"]
  spec.summary       = %q{A cataloguing interface}
  spec.description   = %q{A cataloguing interface for works and manifestations}
  spec.homepage      = "http://deichman.com/"
  spec.license       = "MIT"

  spec.files         = ['lib/catalinker.rb']
  spec.executables   = ['bin/catalinker']
  spec.test_files    = ['tests/test_catalinker.rb']
  spec.require_paths = ["lib"]
end