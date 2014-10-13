# -*- mode: ruby -*-
# vi: set ft=ruby :
require 'fileutils'

pillar_example_files = 'pillar/**/admin.sls.example'

Dir.glob(pillar_example_files).each do | example_file |
  example_file_prev = example_file + "_prev"
  pillar_file =  example_file.sub(/\.example$/, '')
  if !File.file?(pillar_file) || FileUtils.compare_file(pillar_file, example_file_prev)
    puts "Note! Copying #{pillar_file} from #{example_file} ..."
    FileUtils.cp(example_file, pillar_file)
  end
  if !FileUtils.compare_file(pillar_file, example_file)
    puts "Note: You are running a customized #{pillar_file}."
  end
end


Vagrant.configure(2) do |config|

  # **** vm-ship - Docker container ship ****

  config.vm.define "vm-ship" do |config|
    # https://vagrantcloud.com/ubuntu/trusty64
    config.vm.box = "ubuntu/trusty64"
    config.vm.hostname = "vm-ship"

    # http://fgrehm.viewdocs.io/vagrant-cachier
    if Vagrant.has_plugin?("vagrant-cachier")
      config.cache.scope = :box
    end

    config.vm.provider "virtualbox" do |vb|
      vb.customize ["modifyvm", :id, "--memory", "1024"]
    end

    config.vm.network "private_network", ip: "192.168.50.12"
    # Sync folders salt and pillar in virtualboxes
    config.vm.synced_folder "salt", "/srv/salt"
    config.vm.synced_folder "pillar", "/srv/pillar"

    config.vm.provision :salt do |salt|
      salt.minion_config = "salt/minion"
      salt.run_highstate = true
      salt.verbose = true
      salt.pillar_data
      salt.bootstrap_options = "-g https://github.com/saltstack/salt.git"
      salt.install_type = "git"
      salt.install_args = "v2014.1.10"
    end
  end

  # **** vm-test - Feature test runner ****

  config.vm.define "vm-test", primary: true do |config|
    config.vm.box = "ubuntu/trusty64"
    config.vm.hostname = "vm-test"

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
    config.vm.synced_folder "pillar", "/srv/pillar"           # share pillar with vm-ext
    config.vm.synced_folder "test", "/home/vagrant/vm-test"

    config.vm.network "private_network", ip: "192.168.50.11"

    # get vagrant insecure private key to vm-test to allow ssh from vm-test to vm-ext
    config.vm.provision "shell", inline: <<-SCRIPT
      wget --no-check-certificate https://raw.githubusercontent.com/mitchellh/vagrant/master/keys/vagrant -O /home/vagrant/.ssh/insecure_private_key
      chmod 600 /home/vagrant/.ssh/insecure_private_key
      chown vagrant:vagrant /home/vagrant/.ssh/insecure_private_key
    SCRIPT

    config.vm.provision :salt do |salt|
      salt.minion_config = "salt/minion"
      salt.run_highstate = true
      salt.verbose = true
      salt.install_type = "git"
      salt.bootstrap_options = "-g https://github.com/saltstack/salt.git"
      salt.install_args = "v2014.1.10"
    end
  end # vm-test

  # **** vm-devops - Monitors the system logs ****

  config.vm.define "vm-devops" do |config|
    config.vm.box = "ubuntu/trusty64"
    config.vm.hostname = "vm-devops"

    # X forwarding for Firefox Browser
    unless ENV['NO_PUBLIC_PORTS']
      config.ssh.forward_x11 = true
      config.ssh.forward_agent = true
    end

    config.vm.provider "virtualbox" do |vb|
      vb.customize ["modifyvm", :id, "--memory", "2048"]
    end

    # http://fgrehm.viewdocs.io/vagrant-cachier
    if Vagrant.has_plugin?("vagrant-cachier")
      config.cache.scope = :box
    end

    config.vm.synced_folder "salt", "/srv/salt"
    config.vm.synced_folder "pillar", "/srv/pillar"

    config.vm.network "private_network", ip: "192.168.50.21"

    config.vm.provision :salt do |salt|
      salt.minion_config = "salt/minion"
      salt.run_highstate = true
      salt.verbose = true
      salt.install_type = "git"
      salt.bootstrap_options = "-g https://github.com/saltstack/salt.git"
      salt.install_args = "v2014.1.10"
    end
  end # vm-devops

end
