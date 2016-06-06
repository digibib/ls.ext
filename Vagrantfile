# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|

  # **** vm-ship - Docker container ship ****

  ship_name = (ENV['LSDEVMODE'] || "dev") + "-ship" # Set LSDEVMODE to 'dev' or 'build'
  config.vm.define ship_name do |config|
    # https://vagrantcloud.com/ubuntu/trusty64
    config.vm.box = "ubuntu/trusty64"
    config.vm.hostname = ship_name

    # http://fgrehm.viewdocs.io/vagrant-cachier
    if Vagrant.has_plugin?("vagrant-cachier")
      config.cache.scope = :box
    end

    config.vm.provider "virtualbox" do |vb|
      vb.memory = 5120
      vb.cpus = (ENV['LSCPUS'] || "4").to_i
      vb.customize ["modifyvm", :id, "--paravirtprovider", "kvm"]
    end

    config.vm.provision "shell" do |s|
      s.privileged = false
      s.inline = "sudo sed -i '/tty/!s/mesg n/tty -s \\&\\& mesg n/' /root/.profile"
    end

    config.vm.network "private_network", ip: "192.168.50.12"

    if ENV['LSDEVMODE'] == 'dev'
      # sync node app source trees. Use NFS to enable instant reload (for MAC-users)
      if ENV['MOUNT_WITH_NFS']
        config.vm.synced_folder "redef/catalinker/server", "/mnt/catalinker_server", type: "nfs"
        config.vm.synced_folder "redef/catalinker/client", "/mnt/catalinker_client", type: "nfs"
        config.vm.synced_folder "redef/catalinker/public", "/mnt/catalinker_public", type: "nfs"

        config.vm.synced_folder "redef/patron-client/src", "/mnt/patron-client_src", type: "nfs"
        config.vm.synced_folder "redef/patron-client/test", "/mnt/patron-client_test", type: "nfs"
      else
        config.vm.synced_folder "redef/catalinker/server", "/mnt/catalinker_server"
        config.vm.synced_folder "redef/catalinker/client", "/mnt/catalinker_client"
        config.vm.synced_folder "redef/catalinker/public", "/mnt/catalinker_public"

        config.vm.synced_folder "redef/patron-client/src", "/mnt/patron-client_src"
        config.vm.synced_folder "redef/patron-client/test", "/mnt/patron-client_test"
      end
    end

    config.vm.provision "shell" do |s|
      s.path = "provision.sh"
      s.args = ["#{ENV['LSDEVMODE']}"]
    end

  end

end
