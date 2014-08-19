# -*- mode: ruby -*-
# vi: set ft=ruby :
require 'fileutils'  

pillar_example_files = 'pillar/**/admin.sls.example'

Dir.glob(pillar_example_files).each do | example_file |
  pillar_file =  example_file.sub(/\.example$/, '')
  if !File.file?(pillar_file)
    puts "Note! Copying #{pillar_file} from #{example_file} ..."
    FileUtils.cp(example_file, pillar_file)
  end
end


Vagrant.configure(2) do |config|

  # **** ls.ext - System under test **** 

  config.vm.define "ls.ext" do |config|
    # https://vagrantcloud.com/ubuntu/trusty64
    config.vm.box = "ubuntu/trusty64"
    
    # http://fgrehm.viewdocs.io/vagrant-cachier
    if Vagrant.has_plugin?("vagrant-cachier")
      config.cache.scope = :box
    end

    # config.vm.network :forwarded_port, guest: 80, host: 8000                      # MARC2RDF
    # config.vm.network :forwarded_port, guest: 6001, host: 6001                    # SIP2
    unless ENV['NO_PUBLIC_PORTS']
      config.vm.network :forwarded_port, guest: 8080, host: 8080  # OPAC
      config.vm.network :forwarded_port, guest: 8081, host: 8081  # INTRA
    end
    # config.vm.network :forwarded_port, guest: 3000, host: 3000                    # SPARQL
    
    config.vm.network "private_network", ip: "192.168.50.10"
    # Sync folders salt and pillar in virtualboxes
    config.vm.synced_folder "salt", "/srv/salt"
    config.vm.synced_folder "pillar", "/srv/pillar"

    config.vm.provision :salt do |salt|
      salt.minion_config = "salt/minion"
      salt.run_highstate = true
      salt.verbose = true
      salt.pillar_data
    end
  end

  # **** ls.test - Feature test runner **** 

  config.vm.define "ls.test", primary: true do |config|
    config.vm.box = "ubuntu/trusty64"

    # X forwarding for Firefox Browser
    unless ENV['NO_PUBLIC_PORTS']    
      config.ssh.forward_x11 = true
      config.ssh.forward_agent = true
    end

    config.vm.provider "virtualbox" do |vb|
      vb.customize ["modifyvm", :id, "--memory", "768"]
    end
    
    # http://fgrehm.viewdocs.io/vagrant-cachier
    if Vagrant.has_plugin?("vagrant-cachier")
      config.cache.scope = :box
    end

    config.vm.synced_folder "test/salt", "/srv/salt"
    config.vm.synced_folder "pillar", "/srv/pillar"           # share pillar with ls.ext
    config.vm.synced_folder "test", "/home/vagrant/ls.test"

    config.vm.network "private_network", ip: "192.168.50.11"

    config.vm.provision :salt do |salt|
      salt.minion_config = "salt/minion"
      salt.run_highstate = true
      salt.verbose = true
    end  
  end # ls.test

end
