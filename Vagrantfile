# -*- mode: ruby -*-
# vi: set ft=ruby :
require 'fileutils'

SALT_VERSION = "v2014.7.0"

vagrant_root = File.dirname(__FILE__)

koha_pillar_example = "#{vagrant_root}/pillar/koha/admin.sls.example"

koha_pillar_example_prev = koha_pillar_example + "_prev"
pillar_file =  koha_pillar_example.sub(/\.example$/, '')
if !File.file?(pillar_file) || FileUtils.compare_file(pillar_file, koha_pillar_example_prev)
  puts "Note! Copying #{pillar_file} from #{koha_pillar_example} ..."
  FileUtils.cp(koha_pillar_example, pillar_file)
end
if !FileUtils.compare_file(pillar_file, koha_pillar_example)
  puts "Note: You are running a customized #{pillar_file}."
end

migration_pillar_example_file= "#{vagrant_root}/pillar/migration/admin.sls.example"
migration_pillar_file =  migration_pillar_example_file.sub(/\.example$/, '')
if !File.file?(migration_pillar_file) 
  raise "ERROR: You need to create a valid #{migration_pillar_file} based on #{migration_pillar_example_file}"
end

puts `#{vagrant_root}/ssh/generate_keys.sh`

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
      vb.customize ["modifyvm", :id, "--memory", "2048"]
    end

    config.vm.network "private_network", ip: "192.168.50.12"
    # Sync folders salt and pillar in virtualboxes
    config.vm.synced_folder "salt", "/srv/salt"
    config.vm.synced_folder "pillar", "/srv/pillar"

    config.vm.provision "shell", path: "pip_install.sh"

    config.vm.provision "shell", path: "ssh/accept_keys.sh"

    config.vm.provision :salt do |salt|
      salt.minion_config = "salt/minion"
      salt.run_highstate = true
      salt.verbose = true
      salt.pillar_data
      salt.bootstrap_options = "-g https://github.com/saltstack/salt.git"
      salt.install_type = "git"
      salt.install_args = SALT_VERSION
      salt.always_install = true
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

    config.vm.provision "shell", path: "ssh/add_keys.sh"

    config.vm.provision :salt do |salt|
      salt.minion_config = "test/salt/minion"
      salt.run_highstate = true
      salt.verbose = true
      salt.install_type = "git"
      salt.bootstrap_options = "-g https://github.com/saltstack/salt.git"
      salt.install_args = SALT_VERSION
      salt.always_install = true
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

    config.vm.provision "shell", path: "pip_install.sh"

    config.vm.provision :salt do |salt|
      salt.minion_config = "salt/minion"
      salt.run_highstate = true
      salt.verbose = true
      salt.install_type = "git"
      salt.bootstrap_options = "-g https://github.com/saltstack/salt.git"
      salt.install_args = SALT_VERSION
      salt.always_install = true
    end
  end # vm-devops

end
