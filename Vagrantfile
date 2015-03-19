# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|
  config.vm.define "redef-devbox" do |config|
    # https://vagrantcloud.com/ubuntu/trusty64
    config.vm.box = "ubuntu/trusty64"
    config.vm.hostname = "redef-devbox"

    # X forwarding for Firefox Browser
    unless ENV['NO_PUBLIC_PORTS']
      config.ssh.forward_x11 = true
      config.ssh.forward_agent = true
    end

    # http://fgrehm.viewdocs.io/vagrant-cachier
    if Vagrant.has_plugin?("vagrant-cachier")
      config.cache.scope = :box
    end

    config.vm.network "private_network", ip: "192.168.50.50"

    config.vm.provision "shell", path: "upgrade_once.sh"
    config.vm.provision "shell", path: "install_docker.sh"
    config.vm.provision "shell", path: "install_jdk.sh"
    config.vm.provision "shell", path: "install_maven.sh"
  end
end
